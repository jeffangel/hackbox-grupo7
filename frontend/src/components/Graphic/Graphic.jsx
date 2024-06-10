import { Box } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { ForceGraph2D } from "react-force-graph";


export default function Graphic({ jobData }) {
  const imgCache = useRef({});

  useEffect(() => {
    if (jobData && jobData.nodes) {
      jobData.nodes.forEach((node) => {
        if (node.svg && !imgCache.current[node.id]) {
          const img = new Image();
          img.src = node.svg;
          img.onload = () => {
            imgCache.current[node.id] = img;
          };
        }
      });
    }
  }, [jobData]);

  return (
    <Box>
      {jobData &&
        jobData.nodes && (
          <ForceGraph2D
            graphData={jobData}
            height={600}
            nodeLabel="name"
            nodeCanvasObject={(node, ctx, globalScale) => {
              const size = node.size / 30 || 10;
              if (imgCache.current[node.id]) {
                ctx.drawImage(
                  imgCache.current[node.id],
                  node.x - size / 10,
                  node.y - size / 10,
                  size,
                  size
                );
              } else {
                ctx.beginPath();
                ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                ctx.fillStyle = node.color || "gray";
                ctx.fill();
              }

              const label = node.name || node.id;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.fillStyle = "black";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(label, node.x, node.y + size + fontSize);
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
              const size = node.size / 10 || 10;
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, true);
              ctx.fill();
            }}
            linkDirectionalArrowLength={6.5}
            linkDirectionalArrowRelPos={1}
            linkCurvature={0.25}
            linkWidth={2.5}
            linkColor={(link) => "rgba(0,0,0,0.4)"}
            d3Force="charge"
            d3AlphaDecay={0.05}
            d3VelocityDecay={0.4}
            d3ForceStrength={{
              link: 0.3,
              charge: -1000,
              collide: 100,
              x: 0.15,
              y: 0.15,
            }}
            linkDistance={200}
          />
        )}
    </Box>
  );
}
