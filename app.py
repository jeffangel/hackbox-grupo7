import os
import traceback
import re
import itertools
import random
import logging

from dotenv import load_dotenv
from gremlin_python.driver import client, serializer
from flask import Flask, jsonify, request
from flask_cors import CORS
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from openai import AzureOpenAI
from azure.ai.formrecognizer import DocumentAnalysisClient

load_dotenv()
gremlin_service = os.getenv('GREMLIN_SERVICE')
gremlin_database = os.getenv('GREMLIN_DATABASE')
gremlin_graph = os.getenv('GREMLIN_GRAPH')
gremlin_password = os.getenv('GREMLIN_PASSWORD')
search_service = os.getenv('SEARCH_SERVICE')
search_index = os.getenv('SEARCH_INDEX')
search_password = os.getenv('SEARCH_PASSWORD')
document_service = os.getenv('DOCUMENT_SERVICE')
document_password = os.getenv('DOCUMENT_PASSWORD')
azureopenai_service = os.getenv('AZUREOPENAI_SERVICE')
azureopenai_api_version = os.getenv('AZUREOPENAI_API_VERSION')
azureopenai_password = os.getenv('AZUREOPENAI_PASSWORD')
azureopenai_deployment = os.getenv('AZUREOPENAI_DEPLOYMENT')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.logger.setLevel(logging.DEBUG)
logging.basicConfig(level=logging.DEBUG)

def send_gremlin_query(client, query):
    try:
        callback = client.submitAsync(query)
        if callback.result() is not None:
            for result in callback.result():
                return result
        else:
            print("Something went wrong with the query")
    except Exception as e:
        print("Failed to execute query")
        traceback.print_exc()

@app.route('/form', methods=['GET'])
def get_by_form():
    logging.debug('Ingresa form endpoint')
    job_title = request.args.get('job_title')
    job_title = job_title.replace("'", "")
    logging.debug(f'Ingresa form endpoint {job_title}')
    return jsonify({'table': get_table(job_title), 'graph': get_graph(job_title)})

@app.route('/file', methods=['POST'])
def get_by_file():
    binary_data = request.data
    job_description = get_content_file(binary_data)
    job_title = get_job_title(job_description)
    return jsonify({'table': get_table(job_title), 'graph': get_graph(job_title)})

def get_content_file(binary_data):
    content = []
    client = create_client_document()
    poller = client.begin_analyze_document("prebuilt-layout", document=binary_data)
    result = poller.result()
    for page in result.pages:
        for line in page.lines:
            content.append(line.content)
    content = ''.join(content)
    content = ''.join(letter for letter in content if letter.isalnum() or letter == " " or letter == "," or letter == "/")
    client.close()
    return content

def get_job_title(job_description):
    client = create_client_openai()
    job_titles = list_job_titles()
    system_message = f"""Los perfiles de trabajo son:
                            - {job_titles} """
    
    print(system_message)
    response = client.chat.completions.create(
        model=azureopenai_deployment,
        messages=[
            {"role": "user", "content": f"""Debes responder solo con uno de los siguientes perfiles de trabajo: {job_titles}.
                                            La descrición de trabajo es {job_description}.
                                            Indicame el perfil de trabajo que más tiene relación con la descripción de trabajo.
                                            Si no encuentras alguna válida, elige un perfil de trabajo al azar dentro del listado brindado
                                            Solo dime el nombre puntalmente sin ningún texto adicional
                                        """}
        ],
        max_tokens=100,
    )
    client.close()
    print(response.choices[0].message.content)
    return  response.choices[0].message.content

def list_job_titles():
    job_titles = set()
    client = create_client_search()
    results = client.search(search_text='')
    for result in results:
        job_title = re.sub(r'\b[a-z]', lambda m: m.group().upper(), result['job_title'].lower())
        job_titles.add(job_title)
    client.close()
    return ({'data': job_titles})

def get_graph(job_title):
    logging.debug(f'Ingresa get_graph')
    vertices = []
    nodes = []
    links = []
    client = create_client_cosmos()
    nodes.append({'id': job_title, 'size': 500, 'fontSize': 18, 'color': 'black', "symbolType": "rhombus"})
    print(f"""g.V().has('category', 'job_title').has('name', '{job_title}').out().values('name')""")
    vertices_query = f"""g.V().has('category','job_title').has('name','{job_title}').out().values('name')"""
    vertices_countries = send_gremlin_query(client, vertices_query)
    for country in vertices_countries:
        vertices_query = f"""g.V().has('category','people').has('country', '{country}').has('job_title','{job_title}').values('name')"""
        names = send_gremlin_query(client, vertices_query)
        vertices_query = f"""g.V().has('category','people').has('country', '{country}').has('job_title','{job_title}').values('company')"""
        companies = send_gremlin_query(client, vertices_query)
        vertices += zip(names,itertools.repeat(country),companies)
        nodes.append({'id': country, 'size': 300, 'symbolType': 'circle', 'color': 'red'})
        links.append({'source': job_title, 'target': country})
        #sleep(0.1)
    random_numbers = select_image(len(vertices))
    
    for i in enumerate(vertices):
        svg = f'https://randomuser.me/api/portraits/women/{random_numbers[i[0]]}.jpg'
        nodes.append({'id': i[1][0], 'svg': svg, 'company': i[1][2], 'size': 400})
        links.append({'source': i[1][1], 'target': i[1][0]})
    
    client.close()
    logging.debug(f'Ingresa nodes and links {nodes} ---------- {links}')
    return ({'nodes': nodes, 'links': links})

def select_image(quantity):
    return random.sample(range(100), quantity)

def get_table(job_title):
    logging.debug(f'Ingresa get_table')
    data = []
    client = create_client_search()
    results = client.search(search_text=job_title)

    for result in results:
        related = [0 if job_title == result['job_title'] else 1]
        data.append({'fullname': result['fullname'],'job_title': result['job_title'],'country': result['country'],'skills': result['skills'],'university': result['university'],'company': result['company'],'related ': related[0],'url': 'https://www.linkedin.com/company/microsoft/',})
    client.close()
    logging.debug(f'Ingresa get_graph data {data}')
    return ({'data': data})

def create_client_cosmos():
    logging.debug(f'Ingresa client cosmos')
    return client.Client(
        url=f"wss://{gremlin_service}.gremlin.cosmos.azure.com:443/",
        traversal_source="g",
        username=f"/dbs/{gremlin_database}/colls/{gremlin_graph}",
        password=f"{gremlin_password}",
        message_serializer=serializer.GraphSONSerializersV2d0(),
    )

def create_client_search():
    logging.debug(f'Ingresa client search')
    service_endpoint = f'https://{search_service}.search.windows.net'
    index_name = search_index
    key = search_password
    return SearchClient(service_endpoint, index_name, AzureKeyCredential(key))

def create_client_document():
    logging.debug(f'Ingresa client document')
    endpoint = f"https://{document_service}.cognitiveservices.azure.com/"
    key = document_password
    return DocumentAnalysisClient(endpoint=endpoint, credential=AzureKeyCredential(key))

def create_client_openai():
    logging.debug(f'Ingresa client openai')
    base_url = f"https://{azureopenai_service}.openai.azure.com/"
    api_version = azureopenai_api_version
    api_key = azureopenai_password
    return AzureOpenAI(api_key=api_key, api_version=api_version, azure_endpoint=base_url)

if __name__ == '__main__':
    logging.debug(f'Ingresa __name__')
    app.run(debug=True)
