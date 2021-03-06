
const ADD_USER = "ADD_USER";
const SET_INITIAL_PIXELS = "SET_INITIAL_PIXELS";
const SET_CTX = "SET_CTX";
const REDRAW = "REDRAW";
const SET_POINTER = "SET_POINTER";
const SAVE = "SAVE";
const DRAW_PIXEL = "DRAW_PIXEL";

export default function reducer(state, action) {

  switch (action.type) {
    case SET_INITIAL_PIXELS: {
      return {
        ...state,
        pixelArrays: action.payload
      }
    }
    case DRAW_PIXEL: {
      let userId = action.payload.user.id;
      const w = state.ctx.canvas.width;
      const h = state.ctx.canvas.height;
      if (!state.color[userId]) return { ...state }; //early exit in case of a race condition where user draws before their color is assigned

      let col = `rgb(${state.color[userId].r},${state.color[userId].g},${state.color[userId].b},1)`
      let highlightCol = `rgb(${state.color[userId].r},${state.color[userId].g},${state.color[userId].b},0.1)`
      state.ctx.lineJoin = "round";

      let userPixels = state.pixelArrays[action.payload.page][userId];
      if (userPixels) {

        let prevPixel = userPixels[userPixels.length - 1];

        state.ctx.beginPath(); //start drawing a single line
        if (action.payload.pixel.tool === "highlighter") {
          state.ctx.lineCap = 'butt';
          state.ctx.strokeStyle = highlightCol;
        } else {
          state.ctx.lineCap = 'round';
          state.ctx.strokeStyle = col;
        }
        state.ctx.lineWidth = action.payload.pixel.strokeWidth || 1;

        if (action.payload.pixel.dragging && prevPixel) { //if we're in dragging mode, use the last pixel
          state.ctx.moveTo(prevPixel.x * w, prevPixel.y * h);
        } else { //else use the current pixel, offset by 1px to the left
          state.ctx.moveTo(action.payload.pixel.x * w, action.payload.pixel.y * h - 1);
        }
        state.ctx.lineTo(action.payload.pixel.x * w, action.payload.pixel.y * h);//draw a line from point mentioned above to the current pixel
        state.ctx.stroke();//draw the line
        state.ctx.closePath();//end the line
      }

      //Adds the pixel to the state:
      if (state.pixelArrays[action.payload.page][userId]) {

        return {
          ...state,
          pixelArrays: {
            ...state.pixelArrays,
            [action.payload.page]: {
              ...state.pixelArrays[action.payload.page],
              [userId]: [...state.pixelArrays[action.payload.page][userId], action.payload.pixel]
            }
          }
        }
      } else { //if first pixel for user

        return {
          ...state,
          pixelArrays: {
            ...state.pixelArrays,
            [action.payload.page]: {
              ...state.pixelArrays[action.payload.page],
              [userId]: [action.payload.pixel]
            }
          }
        }
      }
    }
    case SET_CTX:
      return { ...state, ctx: action.payload };
    case SET_POINTER:
      return {
        ...state,
        pointers: {
          ...state.pointers,
          [action.payload.user]: action.payload.pixel
        }
      };
    case REDRAW: {
      //Redraws the entire canvas
      state.ctx.clearRect(0, 0, state.ctx.canvas.width, state.ctx.canvas.height); //Clears canvas
      const w = state.ctx.canvas.width;
      const h = state.ctx.canvas.height;

      for (let user in state.pixelArrays[action.payload.page]) {
        if (!state.color[user]) return { ...state }; //early exit in case of a race condition where user draws before their color is assigned

        let pixels = state.pixelArrays[action.payload.page][user]; //gets users pixel array
        //Reads colors
        let col = `rgb(${state.color[user].r},${state.color[user].g},${state.color[user].b},1)`
        let highlightCol = `rgb(${state.color[user].r},${state.color[user].g},${state.color[user].b},0.1)`
        state.ctx.lineJoin = "round";

        for (let i in pixels) {
          state.ctx.beginPath(); //start drawing a single line
          if (pixels[i].tool === "highlighter") {
            state.ctx.lineCap = 'butt';
            state.ctx.strokeStyle = highlightCol;
          } else {
            state.ctx.lineCap = 'round';
            state.ctx.strokeStyle = col;
          }
          state.ctx.lineWidth = pixels[i].strokeWidth || 1;

          if (pixels[i].dragging && pixels[i - 1]) { //if we're in dragging mode, use the last pixel
            state.ctx.moveTo(pixels[i - 1].x * w, pixels[i - 1].y * h);
          } else { //else use the current pixel, offset by 1px to the left
            state.ctx.moveTo(pixels[i].x * w, pixels[i].y * h - 1);
          }
          state.ctx.lineTo(pixels[i].x * w, pixels[i].y * h);//draw a line from point mentioned above to the current pixel
          state.ctx.stroke();//draw the line
          state.ctx.closePath();//end the line
        }
      }
      for (let user in state.pointers) {
        if (state.pointers[user] && state.pointers[user].x) {
          state.ctx.beginPath();
          let x = state.pointers[user].x * w;
          let y = state.pointers[user].y * h;
          let r = state.pointers[user].strokeWidth / 2;

          let gradient = state.ctx.createRadialGradient(x, y, r, x, y, 10 * r);
          let col = `rgb(${state.color[user].r},${state.color[user].g},${state.color[user].b},1)`

          gradient.addColorStop(0, col);
          // gradient.addColorStop(1, 'white');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

          state.ctx.arc(x, y, 7 * r, 0, 2 * Math.PI);
          state.ctx.fillStyle = gradient;
          state.ctx.fill();
        }
      }
      return { ...state };
    }
    case SAVE: {
      let ctx = action.payload.ctx;

      ctx.drawImage(action.payload.backgroundImage, 0, 0, action.payload.backgroundImage.width, action.payload.backgroundImage.height);

      const w = ctx.canvas.width;
      const h = ctx.canvas.height;

      for (let user in state.pixelArrays[action.payload.page]) {

        let pixels = state.pixelArrays[action.payload.page][user]; //gets users pixel array
        //Reads colors
        let col = `rgb(${state.color[user].r},${state.color[user].g},${state.color[user].b},1)`
        let highlightCol = `rgb(${state.color[user].r},${state.color[user].g},${state.color[user].b},0.1)`
        ctx.lineJoin = "round";

        for (let i in pixels) {
          ctx.beginPath(); //start drawing a single line
          if (pixels[i].tool === "highlighter") {
            ctx.lineCap = 'butt';
            ctx.strokeStyle = highlightCol;
          } else {
            ctx.lineCap = 'round';
            ctx.strokeStyle = col;
          }
          ctx.lineWidth = pixels[i].strokeWidth || 1;

          if (pixels[i].dragging && pixels[i - 1]) { //if we're in dragging mode, use the last pixel
            ctx.moveTo(pixels[i - 1].x * w, pixels[i - 1].y * h);
          } else { //else use the current pixel, offset by 1px to the left
            ctx.moveTo(pixels[i].x * w, pixels[i].y * h - 1);
          }
          ctx.lineTo(pixels[i].x * w, pixels[i].y * h);//draw a line from point mentioned above to the current pixel

          ctx.stroke();//draw the line
          ctx.closePath();//end the line
        }
      }
      state.finishedSaving[action.payload.page] = ctx.canvas.toDataURL();
      return { ...state, ctx: ctx };
    }
    case ADD_USER: {
      return {
        ...state,
        color: {
          ...state.color,
          [action.payload.user]: action.payload.color
        },
      };
    }
    default:
      throw new Error();
  }
}

export {
  ADD_USER,
  SET_INITIAL_PIXELS,
  SET_CTX,
  REDRAW,
  SET_POINTER,
  SAVE
}
