var Frate = {val:0.0254};
var Krate = {val:0.0572};
var Tstep = {val:3};
var Scale = {val:1};
var sizeX = 512;
var sizeY = 512;
var Parent = document.body;
var ParentWidth = Parent.clientWidth;
var ParentHeight = Parent.clientHeight;
var Canvas = document.createElement("canvas");
Canvas.width = sizeX * 2;
Canvas.height = sizeY;
Parent.appendChild(Canvas);
var gl = Canvas.getContext("experimental-webgl");
gl.clearColor(0.2, 0.5, 0.5, 1);
gl.clear(gl.COLOR_BUFFER_BIT);
var float_texture_ext = gl.getExtension("OES_texture_float");
var vs = document.getElementById("vs").textContent;
var fsSim = document.getElementById("fsSim").textContent;
var fsCopy = document.getElementById("fsCopy").textContent;
var fsCompositFast = document.getElementById("fsCompositFast").textContent;
var fsCompositSlow = document.getElementById("fsCompositSlow").textContent;
var fsBichrome = document.getElementById("fsBichrome").textContent;
var vsPoint = document.getElementById("vsPoint").textContent;
var fsRed = document.getElementById("fsRed").textContent;
var programMouse = createProgram(vsPoint, fsRed);
gl.useProgram(programMouse);
var MouseBuffer = gl.createBuffer();
var program = createProgram(vs, fsSim);
var program_copy = createProgram(vs, fsCopy);
var ProgramCompositFast = createProgram(vs, fsCompositFast);
var ProgramComposit4C = createProgram(vs, fsCompositSlow);
var ProgramComposit2C = createProgram(vs, fsBichrome);
var Colors = new Float32Array([0.99, 0.68, 0.1, 0.23, 0.08, 0.45, 0.81, 0.33, 0.93, 0.16, 0.31, 0.66, 0.14, 0.64, 0.07, 0.9]);
gl.useProgram(ProgramComposit4C);
gl.uniform4fv(gl.getUniformLocation(ProgramComposit4C, "Colors"), Colors);
var Colors2 = new Float32Array([0.99, 0.68, 0.1, 0, 0.08, 0.45, 0.81, 1]);
gl.useProgram(ProgramCompositFast);
gl.uniform4fv(gl.getUniformLocation(ProgramCompositFast, "Colors"), Colors2);
var CurrentCompositor = ProgramCompositFast;
gl.useProgram(program);
program.samplerUniform = gl.getUniformLocation(program, "uSampler");
gl.uniform1i(program.samplerUniform, 0);
gl.uniform2f(gl.getUniformLocation(program, "p"), 1 / sizeX, 1 / sizeY);
gl.uniform1f(gl.getUniformLocation(program, "TimeStep"), 0.99);
gl.uniform1f(gl.getUniformLocation(program, "Frate"), 0.019);
gl.uniform1f(gl.getUniformLocation(program, "Krate"), 0.048);
gl.uniform1f(gl.getUniformLocation(program, "Scale"), 1);
var posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
var vertices = new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0.1, 0, 0.1, 0.1, 0, -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]);
var aPosLoc = gl.getAttribLocation(program, "aPos");
gl.enableVertexAttribArray(aPosLoc);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.vertexAttribPointer(aPosLoc, 3, gl.FLOAT, gl.FALSE, 0, 0);
var aTexLoc = gl.getAttribLocation(program, "aVertexPosition");
gl.enableVertexAttribArray(aTexLoc);
var texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0.1, 0, 0, 0.1, 0.1, 0.1, -1, -1, 1, -1, -1, 0, 1, 0]);
var texBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
gl.vertexAttribPointer(aTexLoc, 2, gl.FLOAT, gl.FALSE, 0, 0);
var rawData = new Float32Array(createNoise(sizeX, sizeY));
var texture1 = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture1);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sizeX, sizeY, 0, gl.RGBA, gl.FLOAT, rawData);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
var texture2 = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture2);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sizeX, sizeY, 0, gl.RGBA, gl.FLOAT, rawData);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
var buffer1 = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, buffer1);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);
var buffer2 = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, buffer2);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture2, 0);
gl.useProgram(program_copy);
var CompTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, CompTexture);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sizeX, sizeY, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(sizeX * sizeY * 4));
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
var CompositBuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, CompositBuffer);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, CompTexture, 0);
gl.viewport(0, 0, sizeX, sizeY);
function Simulate() {
  gl.viewport(0, 0, sizeX, sizeY);
  gl.useProgram(program);
  gl.uniform1f(gl.getUniformLocation(program, "Frate"), Frate.val);
  gl.uniform1f(gl.getUniformLocation(program, "Krate"), Krate.val);
  gl.uniform1f(gl.getUniformLocation(program, "Scale"), Scale.val);
  var TimeStepMult = Math.floor(Tstep.val);
  var Remainder = Math.abs(TimeStepMult - Tstep.val);
  gl.uniform1f(gl.getUniformLocation(program, "TimeStep"), 1);
  for (var i = 0, length = TimeStepMult;i < length;i++) {
    Step();
  }
  if (Remainder > 0.1) {
    gl.uniform1f(gl.getUniformLocation(program, "TimeStep"), Remainder);
    Step();
  }
  function Step() {
    gl.viewport(0, 0, sizeX, sizeY);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer2);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.flush();
    gl.viewport(0, 0, sizeX, sizeY);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.flush();
  }
}
function Composit() {
  gl.viewport(0, 0, sizeX, sizeY);
  gl.useProgram(CurrentCompositor);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.bindFramebuffer(gl.FRAMEBUFFER, CompositBuffer);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.flush();
}
function MousePos(Xoffset, Yoffset) {
  gl.viewport(0, 0, sizeX, sizeY);
  gl.useProgram(programMouse);
  gl.bindFramebuffer(gl.FRAMEBUFFER, buffer1);
  Xoffset = Xoffset * 2 - 1;
  Yoffset = Yoffset * -2 + 1;
  gl.uniform2f(gl.getUniformLocation(programMouse, "OffsetXY"), Xoffset, Yoffset);
  gl.drawArrays(gl.TRIANGLE_STRIP, 4, 4);
  gl.flush();
}
function Tile() {
  gl.viewport(0, 0, Canvas.width, Canvas.height);
  gl.useProgram(program_copy);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, CompTexture);
  gl.activeTexture(gl.TEXTURE0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 8, 4);
  gl.flush();
}
function createShader(str, type) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, str);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw gl.getShaderInfoLog(shader);
  }
  return shader;
}
function createProgram(vstr, fstr) {
  var program = gl.createProgram();
  var vshader = createShader(vstr, gl.VERTEX_SHADER);
  var fshader = createShader(fstr, gl.FRAGMENT_SHADER);
  gl.attachShader(program, vshader);
  gl.attachShader(program, fshader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw gl.getProgramInfoLog(program);
  }
  return program;
}
function screenQuad() {
  var vertexPosBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
  var vertices = [-1, -1, 1, -1, -1, 1, 1, 1];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
  vertexPosBuffer.itemSize = 2;
  vertexPosBuffer.numItems = 4;
  return vertexPosBuffer;
}
function createNoise(width, height) {
  var theArray = [];
  for (var i = 0;i < width;i++) {
    for (var j = 0;j < height;j++) {
      theArray.push(0.9, Math.random() * Math.random() * Math.random() * Math.random() * 1, 1, 1);
    }
  }
  return theArray;
}
function ResetTexture(Target) {
  var NewData = new Float32Array(createNoise(sizeX, sizeY));
  gl.bindTexture(gl.TEXTURE_2D, Target);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sizeX, sizeY, 0, gl.RGBA, gl.FLOAT, NewData);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
}
function ResetSim() {
  ResetTexture(texture1);
  ResetTexture(texture2);
}
function ResetColors() {
  C1 = [Math.random(), Math.random(), Math.random()];
  C2 = [Math.random(), Math.random(), Math.random()];
  C3 = [Math.random(), Math.random(), Math.random()];
  C4 = [Math.random(), Math.random(), Math.random()];
  var RR = 0.299;
  var GR = 0.587;
  var BR = 0.114;
  var sum1 = C1[0] * RR + C1[1] * GR + C1[2] * BR;
  var sum2 = C2[0] * RR + C2[1] * GR + C2[2] * BR;
  var sum3 = C3[0] * RR + C3[1] * GR + C3[2] * BR;
  var sum4 = C4[0] * RR + C4[1] * GR + C4[2] * BR;
  var sum5 = (sum1 + sum2 + sum3 + sum4) / 4;
  sum1 = Math.abs(sum1 - sum5);
  sum2 = Math.abs(sum2 - sum5);
  sum3 = Math.abs(sum3 - sum5);
  sum4 = Math.abs(sum4 - sum5);
  sum5 = (sum1 + sum2 + sum3 + sum4) / 4;
  if (sum5 > 0.25) {
    var NewColors = new Float32Array([C1[0], C1[1], C1[2], 0.2, C2[0], C2[1], C2[2], 0.4, C3[0], C3[1], C3[2], 0.7, C4[0], C4[1], C4[2], 1]);
    CurrentCompositor = ProgramComposit4C;
    gl.useProgram(CurrentCompositor);
    gl.uniform4fv(gl.getUniformLocation(CurrentCompositor, "Colors"), NewColors);
  } else {
    ResetColors();
  }
}
function TwoTone() {
  var C1 = [Math.random(), Math.random(), Math.random()];
  var C2 = ColorShift(C1[0], C1[1], C1[2], MathRandBowl() - 0.5, 0.2 * Math.random() - 0.1, 0.4 * MathRandBowl() - 0.2);
  var NewColors = new Float32Array([C1[0], C1[1], C1[2], 0, C2[0], C2[1], C2[2], 1]);
  CurrentCompositor = ProgramCompositFast;
  gl.useProgram(CurrentCompositor);
  gl.uniform4fv(gl.getUniformLocation(CurrentCompositor, "Colors"), NewColors);
}
function RandomColors(Size, MinDiff) {
}
function ColorShift(r, g, b, Hoffset, Soffset, Loffset) {
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;
  if (max == min) {
    h = 0;
    s = 0;
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  h += Hoffset;
  h = h <= 1 && h >= 0 ? h : h >= 0 ? h % 1 : 1 + h % 1;
  s += Soffset;
  s = s <= 1 && s >= 0 ? s : s >= 0 ? s % 1 : 1 + s % 1;
  l += Loffset;
  l = l <= 1 && l >= 0 ? l : l >= 0 ? l % 1 : 1 + l % 1;
  if (s == 0) {
    r = g = b = l;
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) {
        t += 1;
      }
      if (t > 1) {
        t -= 1;
      }
      if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
      }
      if (t < 1 / 2) {
        return q;
      }
      if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
      }
      return p;
    }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return[r, g, b];
}
function MathRandBowl() {
  return 0.5 + Math.sin(Math.random() * Math.PI * 2) * 0.5;
}

//cylce though some presets
//========================
var PresetCycle = {
  Cursor:0,
  Sets:[
  [0.0134,0.04,1.0],//blobby waves
  [0.0253,0.0548,1.0],//maze
  [0.0412,0.064,0.7],//stripes and dots
  [0.0473,0.06,1.0],//cells
  [0.0733,0.0610,1.0],//slow coral
  [0.0759,0.0601,1.0],//giant cells slow growing
  [0.0794,0.0610,0.9]//slow growing stripes
  ],
Next:function(){
  PresetCycle.Cursor++
  PresetCycle.Cursor = PresetCycle.Cursor % PresetCycle.Sets.length;

  Frate.val = PresetCycle.Sets[PresetCycle.Cursor][0];
  Krate.val = PresetCycle.Sets[PresetCycle.Cursor][1];
  Scale.val = PresetCycle.Sets[PresetCycle.Cursor][2];

  }
}

/*












GUI
===









*/
var GUI = function() {
  var Button = function(x, y, Height, Width, Label, Target) {
    this.Current = 0.5;
    this.x = x;
    this.y = y;
    this.Width = Width;
    this.HandleHeight = 0;
    this.Height = Height;
    this.Label = Label;
    this.Target = Target;
    this.LabelOffsetY = 12;
    this.Ready = true;
    this.redraw = false;
  };
  Button.prototype = {CheckClick:function(x, y) {
    if (x > this.x && (x < this.x + this.Width && (y > this.y && y < this.y + this.Height + this.HandleHeight))) {
      return true;
    } else {
      return false;
    }
  }, Update:function(x, y) {
    if (this.Ready) {
      this.Ready = false;
      if (this.Target) {
        this.Target();
      }
      var that = this;
      setTimeout(function() {
        that.Ready = true;
      }, 500);
    }
  }, GetValue:function() {
    return this.Label;
  }};
  var Slide = function(x, y, Height, Width, Label, Target, min, max) {
    Button.call(this, x, y, Height, Width, Label, Target);
    this.min = min;
    this.max = max;
    this.HandleHeight = 16;
    this.LabelOffsetY = -10;
    if (Target.val) {
      this.Current = (Target.val - min) / (max - min);
    }
  };
  Slide.prototype = new Button;
  Slide.prototype.Update = function(x, y) {
    var NewValue = (x - this.x) / this.Width;
    NewValue = Math.max(0, Math.min(1, NewValue));
    this.Target.val = NewValue * (this.max - this.min) + this.min;
    this.Current = NewValue;
  };
  Slide.prototype.GetValue = function() {
    this.Current = (this.Target.val - this.min) / (this.max - this.min);
    return this.Label + this.Target.val.toFixed(4);
  };
  var GUI_Parent = document.body;
  var GUI_Canvas = document.createElement("canvas");
  GUI_Parent.appendChild(GUI_Canvas);
  GUI_Canvas.style.zIndex = 99;
  var ctx = GUI_Canvas.getContext("2d");
  ctx.canvas.width = 1;
  ctx.canvas.height = 1;
  var GUI_ParentWidth = 0;
  var GUI_ParentHeight = 0;
  var OffsetX = 0;
  var OffsetY = 0;
  var Buttons = [];
  var Clickable = true;
  var Redraw = false;
  var _x = 0;
  var _y = 0;
  UpScale = 1;
  return{Mouse:function() {
    var MovementListeners = [];
    return{X:0, Y:0, DOWN:false, Move:function(event) {
      var Xpos = Math.min(event.clientX, GUI_ParentWidth) / UpScale;
      var Ypos = Math.min(event.clientY, GUI_ParentHeight) / UpScale;
      this.X = Xpos / GUI_ParentWidth;
      this.Y = Ypos / GUI_ParentHeight;
      for (var i = 0;i < MovementListeners.length;i++) {
        MovementListeners[i].Update(Xpos, Ypos);
        Redraw = true;
      }
    }, Click:function(event) {
      var Xpos = event.clientX / UpScale;
      var Ypos = event.clientY / UpScale;
      for (var i = 0;i < Buttons.length;i++) {
        if (Buttons[i].CheckClick(Xpos, Ypos)) {
          Redraw = true;
          Buttons[i].Update(Xpos, Ypos);
        }
      }
    }, Up:function() {
      MovementListeners = [];
      Redraw = false;
      this.DOWN = false;
      setTimeout(function() {
        Clickable = true;
      }, 1);
    }, Down:function(event) {
      var Xpos = event.clientX / UpScale;
      var Ypos = event.clientY / UpScale;
      for (var i = 0;i < Buttons.length;i++) {
        if (Buttons[i].CheckClick(Xpos, Ypos)) {
          Redraw = true;
          Clickable = false;
          Buttons[i].Update(Xpos, Ypos);
          MovementListeners.push(Buttons[i]);
        }
      }
      if (Clickable) {
        this.DOWN = true;
      }
    }, GetMousePosition:function() {
      return[_x, _y];
    }};
  }(), init:function() {
    this.Scale();
    var that = this;
    window.onresize = function() {
      that.Scale();
    };
    GUI_Parent.onmousemove = function(event) {
      that.Mouse.Move(event);
    };
    GUI_Parent.onclick = function(event) {
      that.Mouse.Click(event);
    };
    GUI_Parent.onmousedown = function(event) {
      that.Mouse.Down(event);
    };
    GUI_Parent.onmouseup = function() {
      that.Mouse.Up();
    };
    GUI_Parent.onmouseout = function() {
      that.Mouse.Up();
    };
    setInterval(function() {
      if (Redraw) {
        Redraw = false;
        that.Draw();
      }
    }, 42);
  }, Draw:function() {
    ctx.clearRect(0, 0, GUI_ParentWidth, GUI_ParentHeight);
    for (i = 0;i < Buttons.length;i++) {
      ctx.strokeRect(Buttons[i].x, Buttons[i].y, Buttons[i].Width, Buttons[i].Height);
      ctx.fillRect(Buttons[i].x + Buttons[i].Current * (Buttons[i].Width - Buttons[i].HandleHeight), Buttons[i].y, Buttons[i].HandleHeight, Buttons[i].HandleHeight);
      ctx.fillText(Buttons[i].GetValue(), Buttons[i].x, Buttons[i].y + Buttons[i].LabelOffsetY);
    }
  }, Scale:function() {
    GUI_ParentWidth = GUI_Parent.clientWidth;
    GUI_ParentHeight = GUI_Parent.clientHeight;
    ctx.canvas.width = GUI_ParentWidth;
    ctx.canvas.height = GUI_ParentHeight;
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#fff";
    GUI.Draw();
  }, SaveImg:function(size) {
  }, AddButton:function(x, y, Height, Width, Label, Target) {
    Buttons.push(new Button(x, y, Height, Width, Label, Target));
  }, AddSlider:function(x, y, Height, Width, Label, Target, min, max) {
    Buttons.push(new Slide(x, y, Height, Width, Label, Target, min, max));
  }};
}();
GUI.init();
GUI.AddSlider(20, 30, 16, 200, "Feed ", Frate, 0.002, 0.09);
GUI.AddSlider(20, 80, 16, 200, "Kill ", Krate, 0.002, 0.09);
GUI.AddSlider(20, 130, 16, 200, "Time Step ", Tstep, 0.01, 5);
GUI.AddSlider(20, 180, 16, 200, "Scale ", Scale, 0.1, 1);
GUI.AddButton(20, 230, 16, 60, "    RESET", ResetSim);
GUI.AddButton(90, 230, 16, 60, "   4COLOR", ResetColors);
GUI.AddButton(90, 260, 16, 60, "    2TONE", TwoTone);
GUI.AddButton(20, 260, 16, 60, "    preSET",  PresetCycle.Next );
GUI.Draw();
setInterval(function() {
  if (GUI.Mouse.DOWN) {
    MousePos(GUI.Mouse.X, GUI.Mouse.Y);
  }
  Simulate();
  Composit();
  Tile();
}, 42);

