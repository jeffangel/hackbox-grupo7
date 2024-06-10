import os
import hashlib
import traceback
import re
from time import sleep

from dotenv import load_dotenv
import pandas as pd 
from gremlin_python.driver import client, serializer

load_dotenv()
file_path = os.getenv('FILE_PATH')
encode = os.getenv('ENCODE')
gremlin_service = os.getenv('GREMLIN_SERVICE')
gremlin_database = os.getenv('GREMLIN_DATABASE')
gremlin_graph = os.getenv('GREMLIN_GRAPH')
gremlin_password = os.getenv('GREMLIN_PASSWORD')

def __init__():
    pass

def read_csv():
    pd.set_option('display.max_rows', None)
    df = pd.read_csv(file_path, encoding=encode)
    df['country'] = df['country'].str.lower()
    df['job_title'] = df['job_title'].str.lower()
    title_capitalized = []
    country_capitalized = []

    for _, row in df.iterrows():
        title_capitalized.append(re.sub(r'\b[a-z]', lambda m: m.group().upper(), row['job_title']))
        country_capitalized.append(re.sub(r'\b[a-z]', lambda m: m.group().upper(), row['country']))

    df['job_title'] = title_capitalized
    df['country'] = country_capitalized
    return (df)
    

def generate_id(data):
    ids = []
    for value in list(data):
        ids.append(hashlib.md5(value.encode(encode)).hexdigest())
    return ids

def node_people(df):
    fullname = df['fullname'].tolist()
    df['id'] = generate_id(fullname)
    i = 0
    for _, row in df.iterrows():
        i += 1
        if i > 50:
            sleep(1)
            i = 0
        try:
            query = f"g.addV('{row['fullname']}').property('id', '{row['id']}').property('name', '{row['fullname']}').property('job_title', '{row['job_title']}').property('country', '{row['country']}').property('skills', '{row['skills']}').property('university', '{row['university']}').property('company', '{row['company']}').property('category', 'people')"
            callback = client.submitAsync(query)
            if callback.result() is None:
                print("Something went wrong with the query")
        except Exception as e:
            print("Failed to execute query")
            traceback.print_exc()

def node_jobtitles(df):
    titles = set(df['job_title'].tolist())
    register_nodes(tuple(zip(titles,generate_id(titles))), 'job_title')

def node_countries(df):
    countries = set(df['country'].tolist())
    register_nodes(tuple(zip(countries,generate_id(countries))), 'country')

def register_nodes(data, category):
    for label, id in data:
        try:
            query = f"g.addV('{label}').property('id', '{id}').property('name', '{label}').property('category', '{category}')"
            callback = client.submitAsync(query)
            if callback.result() is None:
                print("Something went wrong with the query")

        except Exception as e:
            print("Failed to execute query")
            traceback.print_exc()

def edge_country_jobtitle(df):
    df_dedup = df[['job_title','country']].drop_duplicates().reset_index(drop=True)
    titles = set(df_dedup['job_title'].tolist())
    i = 0
    for title in titles:
        df_title = df_dedup.loc[df_dedup['job_title']==title]
        title_id = generate_id([title])[0]
        df_title['country_id'] = generate_id(df_title['country'].tolist())
        for _, row in df_title.iterrows():  
            i += 1
            if i > 80:
                sleep(1)
                i = 0
            try:
                query = f"g.V(['job_title', '{title_id}']).addE('jobs_in').to(g.V(['country', '{row['country_id']}']))"
                callback = client.submitAsync(query)
                if callback.result() is None:
                    print("Something went wrong with the query")
            except Exception as e:
                print("Failed to execute query")
                traceback.print_exc()

def edge_people_country(df):
    df['id'] = generate_id(df['fullname'].tolist())
    df['country_id'] = generate_id(df['country'].tolist())
    i = 0
    for _, row in df.iterrows():  
        i += 1
        if i > 80:
            sleep(1)
            i = 0
        try:
            query = f"g.V(['country', '{row['country_id']}']).addE('lives_in').to(g.V(['people', '{row['id']}']))"
            callback = client.submitAsync(query)
            if callback.result() is None:
                print("Something went wrong with the query")
        except Exception as e:
            print("Failed to execute query")
            traceback.print_exc()

def create_client():
    return client.Client(
        url=f"wss://{gremlin_service}.gremlin.cosmos.azure.com:443/",
        traversal_source="g",
        username=f"/dbs/{gremlin_database}/colls/{gremlin_graph}",
        password=gremlin_password,
        message_serializer=serializer.GraphSONSerializersV2d0(),
    )
    
if __name__ == '__main__':
    client = create_client()
    data = read_csv()
    #node_countries(data)
    #node_jobtitles(data)
    #node_people(data)
    #edge_country_jobtitle(data)
    #edge_people_country(data)
    client.close()


