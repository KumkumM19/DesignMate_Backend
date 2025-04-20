const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const { drawPath, drawGroup } = require("../utils/drawCanvas");

exports.handleUpdate = async (req, res) => {
  try {
    const jsonFilePath = path.join(__dirname, "../../uploads/updated_canvas.json");
    const imageFilePath = path.join(
      __dirname,
      "../../uploads/",
      req.files["image"][0].filename
    );

    if (!fs.existsSync(jsonFilePath)) {
      console.error("❌ JSON file not found!");
      return res.status(400).json({ error: "JSON file missing" });
    }

    let jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
    const imagePath = "/uploads/" + req.files["image"][0].filename;
    const newText = req.body.newText;
    let textUpdated = false;
    let imageUpdated = false;

    const groupedObjectsMap = new Map();

    jsonData.objects.forEach((obj) => {
      if (obj.type === "Group" && Array.isArray(obj.objects)) {
        obj.objects.forEach((child) => {
          const key = generateUniqueKey(child);
          groupedObjectsMap.set(key, child);
        });
      }
    });

    jsonData.objects.forEach((obj) => {
      const key = generateUniqueKey(obj);

      if (obj.type === "Textbox" && !textUpdated) {
        obj.text = newText;
        textUpdated = true;
        if (groupedObjectsMap.has(key)) {
          groupedObjectsMap.get(key).text = newText;
        }
      }

      if (obj.type === "Image" && !imageUpdated) {
        obj.src = imagePath;
        imageUpdated = true;
        if (groupedObjectsMap.has(key)) {
          groupedObjectsMap.get(key).src = imagePath;
        }
      }
    });

    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

    const scaleFactor = 2;
    const nodeCanvas = createCanvas(800 * scaleFactor, 500 * scaleFactor);
    const ctx = nodeCanvas.getContext("2d");
    ctx.scale(scaleFactor, scaleFactor);
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, 800, 500);

    await loadCanvasFromJSON(jsonFilePath, ctx);

    const outputPath = path.join(__dirname, "../../uploads/output.png");
    const out = fs.createWriteStream(outputPath);
    const stream = nodeCanvas.createPNGStream();
    stream.pipe(out);

    out.on("finish", () => {
      res.download(outputPath, "output.png", (err) => {
        if (err) {
          res.status(500).send("Error downloading the image");
        }
      });
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).send("Error processing the request");
  }
};

function generateUniqueKey(obj) {
  return obj.id || `${obj.type}_${obj.left}_${obj.top}_${obj.width}_${obj.height}`;
}

async function loadCanvasFromJSON(jsonPath, ctx) {
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const groupedObjectIds = new Set();

  jsonData.objects.forEach(obj => {
    if (obj.type === "Group" && Array.isArray(obj.objects)) {
      obj.objects.forEach(child => {
        groupedObjectIds.add(generateUniqueKey(child));
      });
    }
  });

  const filteredObjects = jsonData.objects.filter(obj => {
    if (obj.type === "Group") return true;
    return !groupedObjectIds.has(generateUniqueKey(obj));
  });

  for (const obj of filteredObjects) {
    switch (obj.type) {
      case "Textbox":
        ctx.save();
        ctx.translate(obj.left, obj.top);
        ctx.textBaseline = "top";
        ctx.rotate((obj.angle || 0) * Math.PI / 180);
        ctx.scale(obj.flipX ? -obj.scaleX : obj.scaleX || 1, obj.flipY ? -obj.scaleY : obj.scaleY || 1);
        const offsetX = obj.flipX ? -obj.width : 0;
        const offsetY = obj.flipY ? -obj.height : 0;
        ctx.font = `${obj.fontSize}px ${obj.fontFamily || "Arial"}`;
        ctx.fillStyle = obj.fill || "black";
        ctx.fillText(obj.text, offsetX, offsetY);
        if (obj.stroke) {
          ctx.strokeStyle = obj.stroke;
          ctx.lineWidth = obj.strokeWidth || 1;
          ctx.strokeText(obj.text, offsetX, offsetY);
        }
        ctx.restore();
        break;

      case "Image":
        try {
          ctx.save();
          ctx.translate(obj.left, obj.top);
          ctx.rotate((obj.angle || 0) * Math.PI / 180);
          ctx.scale(obj.flipX ? -obj.scaleX : obj.scaleX || 1, obj.flipY ? -obj.scaleY : obj.scaleY || 1);
          const img = await loadImage(`http://localhost:3000${obj.src}`);
          const imageOffsetX = obj.flipX ? -obj.width : 0;
          const imageOffsetY = obj.flipY ? -obj.height : 0;
          ctx.drawImage(img, imageOffsetX, imageOffsetY, obj.width, obj.height);
          if (obj.stroke) {
            ctx.strokeStyle = obj.stroke;
            ctx.lineWidth = obj.strokeWidth || 1;
            ctx.strokeRect(imageOffsetX, imageOffsetY, obj.width, obj.height);
          }
          ctx.restore();
        } catch (err) {
          console.error("Error loading image:", err);
        }
        break;

      case "Path":
        drawPath(ctx, obj, obj.left, obj.top);
        break;

      case "Group":
        await drawGroup(ctx, obj);
        break;
    }
  }
}
