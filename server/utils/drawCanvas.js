const { loadImage } = require("canvas");

function drawPath(ctx, pathData, left, top) {
  if (!pathData.path || !Array.isArray(pathData.path)) return;

  ctx.save();

  const absLeft = left || 0;
  const absTop = top || 0;
  const scaleX = pathData.scaleX || 1;
  const scaleY = pathData.scaleY || 1;
  const angle = (pathData.angle || 0) * Math.PI / 180;

  ctx.translate(absLeft, absTop);
  ctx.rotate(angle);
  ctx.scale(pathData.flipX ? -scaleX : scaleX, pathData.flipY ? -scaleY : scaleY);
  ctx.beginPath();

  for (let command of pathData.path) {
    let type = command[0];
    let values = command.slice(1);
    switch (type) {
      case "M": ctx.moveTo(values[0], values[1]); break;
      case "L": ctx.lineTo(values[0], values[1]); break;
      case "C": ctx.bezierCurveTo(values[0], values[1], values[2], values[3], values[4], values[5]); break;
      case "Z": ctx.closePath(); break;
    }
  }

  if (typeof pathData.fill === "string") {
    ctx.fillStyle = pathData.fill;
    ctx.fill();
  } else if (typeof pathData.fill === "object" && pathData.fill.type === "linear") {
    const gradient = ctx.createLinearGradient(
      pathData.fill.coords.x1,
      pathData.fill.coords.y1,
      pathData.fill.coords.x2,
      pathData.fill.coords.y2
    );
    pathData.fill.colorStops.forEach((stop) => {
      gradient.addColorStop(stop.offset, stop.color);
    });
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  if (pathData.stroke) {
    ctx.strokeStyle = pathData.stroke;
    ctx.lineWidth = pathData.strokeWidth || 1;
    ctx.stroke();
  }

  ctx.restore();
}

async function drawGroup(ctx, group) {
  for (let obj of group.objects) {
    ctx.save();
    ctx.translate(group.left, group.top);
    ctx.rotate((group.angle || 0) * Math.PI / 180);
    ctx.scale(group.scaleX || 1, group.scaleY || 1);

    const absLeft = obj.left + (group.width / 2);
    const absTop = obj.top + (group.height / 2);

    switch (obj.type) {
      case "Textbox":
        ctx.save();
        ctx.translate(absLeft, absTop);
        ctx.textBaseline="top";
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

      case "Path":
        drawPath(ctx, obj, absLeft, absTop);
        break;

      case "Image":
        try {
          ctx.save();
          ctx.translate(absLeft, absTop);
          ctx.rotate((obj.angle || 0) * Math.PI / 180);
          ctx.scale(obj.flipX ? -obj.scaleX : obj.scaleX || 1, obj.flipY ? -obj.scaleY : obj.scaleY || 1);
          const image = await loadImage(`http://localhost:3000${obj.src}`);
          const offsetX = obj.flipX ? -obj.width : 0;
          const offsetY = obj.flipY ? -obj.height : 0;
          ctx.drawImage(image, offsetX, offsetY, obj.width, obj.height);
          if (obj.stroke) {
            ctx.strokeStyle = obj.stroke;
            ctx.lineWidth = obj.strokeWidth || 1;
            ctx.strokeRect(offsetX, offsetY, obj.width, obj.height);
          }
          ctx.restore();
        } catch (err) {
          console.error("Error loading image:", err);
        }
        break;
    }

    ctx.restore();
  }
}

module.exports = { drawPath, drawGroup };
