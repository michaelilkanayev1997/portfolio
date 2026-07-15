import type { FragmentDefinition } from "./fragmentMesh";

const MAX_FRAGMENTS = 80;
const VERTEX_STRIDE = 9;
const POINT_STRIDE = 9;
const MAX_EVENT_SPARKS = 8;
const MAX_STELLAR_POINTS = MAX_FRAGMENTS + MAX_EVENT_SPARKS;

const CONSTELLATION_EDGE_IDS: Array<[string, string]> = [
  ["hair-crown-center", "glass-left-feature"],
  ["hair-crown-center", "glass-right-feature"],
  ["glass-left-feature", "glass-bridge"],
  ["glass-bridge", "glass-right-feature"],
  ["glass-bridge", "skin-nose"],
  ["skin-nose", "skin-mouth"],
  ["skin-mouth", "hand-index-tip"],
  ["hand-index-tip", "watch-center"],
];

export type FragmentTransform = {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  z: number;
  alpha: number;
  edge: number;
  shear: number;
};

export type SparkRender = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  warmth: number;
};

export type PortraitRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const fillVertexShader = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;
layout(location = 2) in vec2 a_center;
layout(location = 3) in float a_piece;
layout(location = 4) in float a_material;
layout(location = 5) in float a_seed;

uniform vec2 u_resolution;
uniform vec4 u_portrait;
uniform vec4 u_pieceTransform[${MAX_FRAGMENTS}];
uniform vec4 u_pieceFx[${MAX_FRAGMENTS}];

out vec2 v_uv;
out float v_material;
out float v_alpha;
out float v_edge;
out float v_seed;
out float v_shear;

void main() {
  int piece = int(a_piece + 0.5);
  vec4 transform = u_pieceTransform[piece];
  vec4 fx = u_pieceFx[piece];
  vec2 local = (a_position - a_center) * u_portrait.zw;
  local.x += local.y * fx.w;
  float cosine = cos(transform.z);
  float sine = sin(transform.z);
  mat2 rotation = mat2(cosine, sine, -sine, cosine);
  float perspectiveLift = 1.0 + clamp(fx.x, 0.0, 1.5) * 0.038;
  local = rotation * local * transform.w * perspectiveLift;

  vec2 home = u_portrait.xy + a_center * u_portrait.zw;
  vec2 pixel = home + transform.xy + local;
  vec2 clip = vec2(
    pixel.x / u_resolution.x * 2.0 - 1.0,
    1.0 - pixel.y / u_resolution.y * 2.0
  );
  gl_Position = vec4(clip, clamp(fx.x * -0.0005, -0.9, 0.9), 1.0);

  v_uv = a_uv;
  v_material = a_material;
  v_alpha = fx.y;
  v_edge = fx.z;
  v_seed = a_seed;
  v_shear = fx.w;
}
`;

const fillFragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform float u_time;

in vec2 v_uv;
in float v_material;
in float v_alpha;
in float v_edge;
in float v_seed;
in float v_shear;

out vec4 outColor;

void main() {
  vec4 source = texture(u_texture, v_uv);
  if (source.a < 0.006 || v_alpha < 0.004) discard;

  vec3 color = source.rgb;

  // Keep the shared time channel alive without spotlighting any accessory.
  // The extremely restrained pulse gives the assembled particle surface a
  // cohesive breath and prevents WebGL from optimizing u_time away.
  color *= 1.0 + sin(u_time * 0.55 + v_seed * 0.35) * 0.0025 * v_edge;

  if (v_material > 1.5 && v_material < 2.5) {
    float fold = sin(v_uv.y * 48.0 + v_uv.x * 13.0 + v_seed * 11.0);
    float foldAmount = min(1.0, abs(v_shear) * 8.0 + v_edge * 0.28);
    color *= 0.97 + fold * 0.055 * foldAmount;
  } else if (v_material < 3.5) {
    color *= 1.0 + v_edge * 0.025;
  } else {
    color *= 0.965 + v_edge * 0.02;
  }

  outColor = vec4(color * v_alpha, source.a * v_alpha);
}
`;

const edgeFragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_texture;

in vec2 v_uv;
in float v_material;
in float v_alpha;
in float v_edge;
in float v_seed;
in float v_shear;

out vec4 outColor;

void main() {
  float textureAlpha = texture(u_texture, v_uv).a;
  if (textureAlpha < 0.08 || v_alpha < 0.02 || v_edge < 0.015) discard;

  vec3 edgeColor = vec3(0.24, 0.68, 1.0);
  if (v_material < 0.5) edgeColor = vec3(0.45, 0.94, 1.0);
  else if (v_material < 1.5) edgeColor = vec3(0.82, 0.9, 1.0);
  else if (v_material < 2.5) edgeColor = vec3(0.18, 0.42, 0.72);
  else if (v_material < 3.5) edgeColor = vec3(0.38, 0.7, 0.9);

  float alpha = (0.02 + v_edge * 0.42) * v_alpha * textureAlpha;
  outColor = vec4(edgeColor * alpha, alpha);
}
`;

const sparkVertexShader = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in float a_size;
layout(location = 2) in float a_alpha;
layout(location = 3) in float a_material;
layout(location = 4) in float a_seed;
layout(location = 5) in float a_kind;
layout(location = 6) in vec2 a_uv;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_time;

out float v_alpha;
out float v_material;
out float v_seed;
out float v_kind;
out vec2 v_uv;

void main() {
  vec2 clip = vec2(
    a_position.x / u_resolution.x * 2.0 - 1.0,
    1.0 - a_position.y / u_resolution.y * 2.0
  );
  gl_Position = vec4(clip, 0.0, 1.0);
  float shineClock = u_time * (0.52 + a_seed * 0.34) + a_seed * 23.7;
  float shineSlot = floor(shineClock);
  float shinePhase = fract(shineClock);
  float shineChance = fract(
    sin((shineSlot + a_seed * 31.17) * 12.9898) * 43758.5453
  );
  float randomShine =
    pow(max(0.0, sin(shinePhase * 3.14159265)), 9.0) *
    smoothstep(0.72, 0.98, shineChance);
  float pulse = a_kind > 0.5
    ? 0.98 +
      sin(u_time * (2.1 + a_seed) + a_seed * 17.0) * 0.02 +
      randomShine * 0.3
    : 1.0;
  gl_PointSize = max(1.0, a_size * pulse * u_pixelRatio);
  v_alpha = a_alpha;
  v_material = a_material;
  v_seed = a_seed;
  v_kind = a_kind;
  v_uv = a_uv;
}
`;

const sparkFragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform float u_time;

in float v_alpha;
in float v_material;
in float v_seed;
in float v_kind;
in vec2 v_uv;
out vec4 outColor;

void main() {
  vec2 point = gl_PointCoord - 0.5;
  float distanceFromCenter = length(point);
  if (distanceFromCenter > 0.5) discard;

  float core = 1.0 - smoothstep(0.018, 0.13, distanceFromCenter);
  float halo = (1.0 - smoothstep(0.05, 0.48, distanceFromCenter)) * 0.11;

  if (v_kind < 0.5) {
    vec3 cool = vec3(0.46, 0.88, 1.0);
    vec3 warm = vec3(1.0, 0.76, 0.34);
    vec3 color = mix(cool, warm, clamp(v_material, 0.0, 1.0));
    float burstRotation = v_seed * 6.2831853 + 0.22;
    float burstCos = cos(burstRotation);
    float burstSin = sin(burstRotation);
    vec2 burstPoint = mat2(
      burstCos,
      -burstSin,
      burstSin,
      burstCos
    ) * point;
    float burstRayX =
      (1.0 - smoothstep(0.008, 0.026, abs(burstPoint.y))) *
      (1.0 - smoothstep(0.06, 0.5, abs(burstPoint.x)));
    float burstRayY =
      (1.0 - smoothstep(0.008, 0.024, abs(burstPoint.x))) *
      (1.0 - smoothstep(0.05, 0.42, abs(burstPoint.y)));
    float burstShape =
      core + halo * 0.8 + max(burstRayX * 0.72, burstRayY * 0.56);
    float alpha = min(1.0, burstShape * v_alpha);
    color = mix(color, vec3(1.0), core * 0.78);
    outColor = vec4(color * alpha, alpha);
    return;
  }

  float rotation = (v_seed - 0.5) * 0.48;
  float c = cos(rotation);
  float s = sin(rotation);
  vec2 starPoint = mat2(c, -s, s, c) * point;
  float horizontalRay =
    (1.0 - smoothstep(0.008, 0.026, abs(starPoint.y))) *
    (1.0 - smoothstep(0.08, 0.48, abs(starPoint.x)));
  float verticalRay =
    (1.0 - smoothstep(0.008, 0.024, abs(starPoint.x))) *
    (1.0 - smoothstep(0.07, 0.4, abs(starPoint.y)));
  float diffraction = max(horizontalRay * 0.72, verticalRay * 0.52);
  float shineClock = u_time * (0.52 + v_seed * 0.34) + v_seed * 23.7;
  float shineSlot = floor(shineClock);
  float shinePhase = fract(shineClock);
  float shineChance = fract(
    sin((shineSlot + v_seed * 31.17) * 12.9898) * 43758.5453
  );
  float randomShine =
    pow(max(0.0, sin(shinePhase * 3.14159265)), 9.0) *
    smoothstep(0.72, 0.98, shineChance);
  float twinkle =
    0.96 +
    sin(u_time * (2.0 + v_seed * 1.2) + v_seed * 19.0) * 0.03 +
    randomShine * 0.38;

  vec3 ice = vec3(0.38, 0.84, 1.0);
  vec3 silver = vec3(0.78, 0.9, 1.0);
  vec3 indigo = vec3(0.26, 0.48, 0.9);
  vec3 skin = vec3(0.82, 0.88, 1.0);
  vec3 midnight = vec3(0.2, 0.46, 0.72);
  vec3 materialColor = v_material < 0.5
    ? ice
    : v_material < 1.5
      ? silver
      : v_material < 2.5
        ? indigo
        : v_material < 3.5
          ? skin
          : midnight;
  vec3 sourceColor = texture(u_texture, v_uv).rgb;
  vec3 color = mix(materialColor, sourceColor, 0.16);
  color = mix(color, vec3(1.0), core * 0.62);
  color = mix(color, vec3(0.94, 0.985, 1.0), randomShine * 0.72);

  float shape = core + halo * (0.72 + v_seed * 0.22 + randomShine * 0.5);
  shape += diffraction *
    (0.32 + (1.0 - v_seed) * 0.18 + randomShine * 0.62);
  shape *= 0.9 + fract(v_seed * 7.31) * 0.16;

  float alpha = min(1.0, shape * v_alpha * twinkle);
  outColor = vec4(color * alpha, alpha);
}
`;

const constellationVertexShader = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in float a_alpha;

uniform vec2 u_resolution;

out float v_alpha;

void main() {
  vec2 clip = vec2(
    a_position.x / u_resolution.x * 2.0 - 1.0,
    1.0 - a_position.y / u_resolution.y * 2.0
  );
  gl_Position = vec4(clip, 0.0, 1.0);
  v_alpha = a_alpha;
}
`;

const constellationFragmentShader = `#version 300 es
precision highp float;

in float v_alpha;
out vec4 outColor;

void main() {
  vec3 color = vec3(0.38, 0.82, 1.0);
  outColor = vec4(color * v_alpha, v_alpha);
}
`;

const compileShader = (
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create portrait shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader error";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
};

const createProgram = (
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
) => {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create portrait program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "Unknown program error";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
};

const uniform = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
) => {
  const location = gl.getUniformLocation(program, name);
  if (!location) throw new Error(`Portrait shader uniform missing: ${name}`);
  return location;
};

type FragmentUniformLocations = {
  resolution: WebGLUniformLocation;
  portrait: WebGLUniformLocation;
  pieceTransform: WebGLUniformLocation;
  pieceFx: WebGLUniformLocation;
  texture: WebGLUniformLocation;
};

const fragmentUniformLocations = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
): FragmentUniformLocations => ({
  resolution: uniform(gl, program, "u_resolution"),
  portrait: uniform(gl, program, "u_portrait"),
  pieceTransform: uniform(gl, program, "u_pieceTransform[0]"),
  pieceFx: uniform(gl, program, "u_pieceFx[0]"),
  texture: uniform(gl, program, "u_texture"),
});

const pushVertex = (
  target: number[],
  fragment: FragmentDefinition,
  x: number,
  y: number,
) => {
  target.push(
    x,
    y,
    x,
    y,
    fragment.center.x,
    fragment.center.y,
    fragment.index,
    fragment.materialId,
    fragment.randomA,
  );
};

const configureFragmentVao = (
  gl: WebGL2RenderingContext,
  buffer: WebGLBuffer,
) => {
  const vao = gl.createVertexArray();
  if (!vao) throw new Error("Unable to create portrait vertex array");
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const stride = VERTEX_STRIDE * Float32Array.BYTES_PER_ELEMENT;
  const attribute = (location: number, size: number, offset: number) => {
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(
      location,
      size,
      gl.FLOAT,
      false,
      stride,
      offset * Float32Array.BYTES_PER_ELEMENT,
    );
  };
  attribute(0, 2, 0);
  attribute(1, 2, 2);
  attribute(2, 2, 4);
  attribute(3, 1, 6);
  attribute(4, 1, 7);
  attribute(5, 1, 8);
  gl.bindVertexArray(null);
  return vao;
};

export class PortraitRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;
  private readonly fillProgram: WebGLProgram;
  private readonly edgeProgram: WebGLProgram;
  private readonly sparkProgram: WebGLProgram;
  private readonly constellationProgram: WebGLProgram;
  private readonly fillBuffer: WebGLBuffer;
  private readonly edgeBuffer: WebGLBuffer;
  private readonly sparkBuffer: WebGLBuffer;
  private readonly constellationBuffer: WebGLBuffer;
  private readonly fillVao: WebGLVertexArrayObject;
  private readonly edgeVao: WebGLVertexArrayObject;
  private readonly sparkVao: WebGLVertexArrayObject;
  private readonly constellationVao: WebGLVertexArrayObject;
  private readonly texture: WebGLTexture;
  private readonly fragments: FragmentDefinition[];
  private readonly constellationEdges: Array<[number, number]>;
  private readonly fillUniforms: FragmentUniformLocations & {
    time: WebGLUniformLocation;
  };
  private readonly edgeUniforms: FragmentUniformLocations;
  private readonly sparkUniforms: {
    resolution: WebGLUniformLocation;
    pixelRatio: WebGLUniformLocation;
    texture: WebGLUniformLocation;
    time: WebGLUniformLocation;
  };
  private readonly constellationUniforms: {
    resolution: WebGLUniformLocation;
  };
  private readonly transformData = new Float32Array(MAX_FRAGMENTS * 4);
  private readonly fxData = new Float32Array(MAX_FRAGMENTS * 4);
  private readonly sparkData = new Float32Array(
    POINT_STRIDE * MAX_STELLAR_POINTS,
  );
  private readonly stellarStrengths = new Float32Array(MAX_FRAGMENTS);
  private readonly screenCenters = new Float32Array(MAX_FRAGMENTS * 2);
  private readonly constellationData = new Float32Array(
    CONSTELLATION_EDGE_IDS.length * 2 * 3,
  );
  private readonly fillVertexCount: number;
  private readonly edgeVertexCount: number;
  private cssWidth = 1;
  private cssHeight = 1;
  private pixelRatio = 1;

  constructor(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    fragments: FragmentDefinition[],
  ) {
    if (fragments.length > MAX_FRAGMENTS) {
      throw new Error(`Portrait fragment limit exceeded: ${fragments.length}`);
    }
    this.canvas = canvas;
    this.fragments = fragments;
    const fragmentIndex = new Map(
      fragments.map((fragment, index) => [fragment.id, index]),
    );
    this.constellationEdges = CONSTELLATION_EDGE_IDS.flatMap(([from, to]) => {
      const fromIndex = fragmentIndex.get(from);
      const toIndex = fragmentIndex.get(to);
      return fromIndex === undefined || toIndex === undefined
        ? []
        : [[fromIndex, toIndex] as [number, number]];
    });
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      depth: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error("WebGL2 is unavailable");
    this.gl = gl;

    this.fillProgram = createProgram(gl, fillVertexShader, fillFragmentShader);
    this.edgeProgram = createProgram(gl, fillVertexShader, edgeFragmentShader);
    this.sparkProgram = createProgram(gl, sparkVertexShader, sparkFragmentShader);
    this.constellationProgram = createProgram(
      gl,
      constellationVertexShader,
      constellationFragmentShader,
    );
    this.fillUniforms = {
      ...fragmentUniformLocations(gl, this.fillProgram),
      time: uniform(gl, this.fillProgram, "u_time"),
    };
    this.edgeUniforms = fragmentUniformLocations(gl, this.edgeProgram);
    this.sparkUniforms = {
      resolution: uniform(gl, this.sparkProgram, "u_resolution"),
      pixelRatio: uniform(gl, this.sparkProgram, "u_pixelRatio"),
      texture: uniform(gl, this.sparkProgram, "u_texture"),
      time: uniform(gl, this.sparkProgram, "u_time"),
    };
    this.constellationUniforms = {
      resolution: uniform(gl, this.constellationProgram, "u_resolution"),
    };

    const fillVertices: number[] = [];
    const edgeVertices: number[] = [];
    fragments.forEach((fragment) => {
      const first = fragment.polygon[0];
      for (let index = 1; index < fragment.polygon.length - 1; index += 1) {
        const second = fragment.polygon[index];
        const third = fragment.polygon[index + 1];
        pushVertex(fillVertices, fragment, first.x, first.y);
        pushVertex(fillVertices, fragment, second.x, second.y);
        pushVertex(fillVertices, fragment, third.x, third.y);
      }
      fragment.polygon.forEach((point, index) => {
        const next = fragment.polygon[(index + 1) % fragment.polygon.length];
        pushVertex(edgeVertices, fragment, point.x, point.y);
        pushVertex(edgeVertices, fragment, next.x, next.y);
      });
    });
    this.fillVertexCount = fillVertices.length / VERTEX_STRIDE;
    this.edgeVertexCount = edgeVertices.length / VERTEX_STRIDE;

    const fillBuffer = gl.createBuffer();
    const edgeBuffer = gl.createBuffer();
    const sparkBuffer = gl.createBuffer();
    const constellationBuffer = gl.createBuffer();
    if (!fillBuffer || !edgeBuffer || !sparkBuffer || !constellationBuffer) {
      throw new Error("Unable to allocate portrait buffers");
    }
    this.fillBuffer = fillBuffer;
    this.edgeBuffer = edgeBuffer;
    this.sparkBuffer = sparkBuffer;
    this.constellationBuffer = constellationBuffer;

    gl.bindBuffer(gl.ARRAY_BUFFER, fillBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fillVertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, edgeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(edgeVertices), gl.STATIC_DRAW);
    this.fillVao = configureFragmentVao(gl, fillBuffer);
    this.edgeVao = configureFragmentVao(gl, edgeBuffer);

    const sparkVao = gl.createVertexArray();
    if (!sparkVao) throw new Error("Unable to create spark vertex array");
    this.sparkVao = sparkVao;
    gl.bindVertexArray(sparkVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, sparkBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.sparkData.byteLength, gl.DYNAMIC_DRAW);
    const sparkStride = POINT_STRIDE * Float32Array.BYTES_PER_ELEMENT;
    const sparkAttribute = (location: number, size: number, offset: number) => {
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(
        location,
        size,
        gl.FLOAT,
        false,
        sparkStride,
        offset * Float32Array.BYTES_PER_ELEMENT,
      );
    };
    sparkAttribute(0, 2, 0);
    sparkAttribute(1, 1, 2);
    sparkAttribute(2, 1, 3);
    sparkAttribute(3, 1, 4);
    sparkAttribute(4, 1, 5);
    sparkAttribute(5, 1, 6);
    sparkAttribute(6, 2, 7);
    gl.bindVertexArray(null);

    const constellationVao = gl.createVertexArray();
    if (!constellationVao) {
      throw new Error("Unable to create constellation vertex array");
    }
    this.constellationVao = constellationVao;
    gl.bindVertexArray(constellationVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, constellationBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      this.constellationData.byteLength,
      gl.DYNAMIC_DRAW,
    );
    const constellationStride = 3 * Float32Array.BYTES_PER_ELEMENT;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, constellationStride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(
      1,
      1,
      gl.FLOAT,
      false,
      constellationStride,
      2 * Float32Array.BYTES_PER_ELEMENT,
    );
    gl.bindVertexArray(null);

    const texture = gl.createTexture();
    if (!texture) throw new Error("Unable to create portrait texture");
    this.texture = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image,
    );

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
  }

  resize(width: number, height: number, pixelRatio: number) {
    this.cssWidth = Math.max(1, width);
    this.cssHeight = Math.max(1, height);
    this.pixelRatio = Math.max(1, pixelRatio);
    const backingWidth = Math.max(1, Math.round(this.cssWidth * this.pixelRatio));
    const backingHeight = Math.max(1, Math.round(this.cssHeight * this.pixelRatio));
    if (this.canvas.width !== backingWidth) this.canvas.width = backingWidth;
    if (this.canvas.height !== backingHeight) this.canvas.height = backingHeight;
    this.gl.viewport(0, 0, backingWidth, backingHeight);
  }

  draw(
    portrait: PortraitRect,
    transforms: FragmentTransform[],
    sparks: SparkRender[],
    time: number,
    constellationAmount = 0,
  ) {
    const gl = this.gl;
    this.transformData.fill(0);
    this.fxData.fill(0);
    transforms.forEach((transform, index) => {
      const offset = index * 4;
      this.transformData[offset] = transform.x;
      this.transformData[offset + 1] = transform.y;
      this.transformData[offset + 2] = transform.rotation;
      this.transformData[offset + 3] = transform.scale;
      this.fxData[offset] = transform.z;
      this.fxData[offset + 1] = transform.alpha;
      this.fxData[offset + 2] = transform.edge;
      this.fxData[offset + 3] = transform.shear;
    });

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    const applyFragmentUniforms = (
      program: WebGLProgram,
      locations: FragmentUniformLocations,
    ) => {
      gl.useProgram(program);
      gl.uniform2f(locations.resolution, this.cssWidth, this.cssHeight);
      gl.uniform4f(
        locations.portrait,
        portrait.left,
        portrait.top,
        portrait.width,
        portrait.height,
      );
      gl.uniform4fv(locations.pieceTransform, this.transformData);
      gl.uniform4fv(locations.pieceFx, this.fxData);
      gl.uniform1i(locations.texture, 0);
    };

    applyFragmentUniforms(this.fillProgram, this.fillUniforms);
    gl.uniform1f(this.fillUniforms.time, time);
    gl.bindVertexArray(this.fillVao);
    gl.drawArrays(gl.TRIANGLES, 0, this.fillVertexCount);

    applyFragmentUniforms(this.edgeProgram, this.edgeUniforms);
    gl.bindVertexArray(this.edgeVao);
    gl.drawArrays(gl.LINES, 0, this.edgeVertexCount);

    this.sparkData.fill(0);
    this.stellarStrengths.fill(0);
    let pointCount = 0;

    transforms.forEach((transform, index) => {
      const definition = this.fragments[index];
      if (!definition) return;
      const screenX =
        portrait.left +
        definition.center.x * portrait.width +
        transform.x;
      const screenY =
        portrait.top +
        definition.center.y * portrait.height +
        transform.y;
      this.screenCenters[index * 2] = screenX;
      this.screenCenters[index * 2 + 1] = screenY;

      const compactness = Math.max(
        0,
        Math.min(1, (0.38 - transform.scale) / 0.28),
      );
      const luminosity = Math.max(
        0,
        Math.min(1, transform.z * 0.82 + 0.08),
      );
      const strength = compactness * luminosity * transform.alpha;
      this.stellarStrengths[index] = strength;
      if (strength < 0.018 || pointCount >= MAX_FRAGMENTS) return;

      const materialAlpha = definition.material === "cloth"
            ? 0.7
            : definition.material === "skin"
              ? 0.72
              : 0.56;
      const offset = pointCount * POINT_STRIDE;
      this.sparkData[offset] = screenX;
      this.sparkData[offset + 1] = screenY;
      const sizeVariance = 0.86 + definition.randomB * 0.54;
      this.sparkData[offset + 2] =
        (10.2 + Math.min(1.35, transform.z) * 22.4) *
        sizeVariance;
      this.sparkData[offset + 3] = Math.min(
        0.97,
        strength * materialAlpha * 1.24,
      );
      this.sparkData[offset + 4] = definition.materialId;
      this.sparkData[offset + 5] = definition.randomA;
      this.sparkData[offset + 6] = 1;
      this.sparkData[offset + 7] = definition.center.x;
      this.sparkData[offset + 8] = definition.center.y;
      pointCount += 1;
    });

    let constellationVertexCount = 0;
    if (
      constellationAmount > 0.12 &&
      this.cssWidth >= 1_100 &&
      this.fragments.length >= 45
    ) {
      this.constellationData.fill(0);
      this.constellationEdges.forEach(([from, to]) => {
        const fromX = this.screenCenters[from * 2];
        const fromY = this.screenCenters[from * 2 + 1];
        const toX = this.screenCenters[to * 2];
        const toY = this.screenCenters[to * 2 + 1];
        // Links only exist during the portrait-map capture in the quiet right
        // gutter. Deep-section satellites keep their individual glints.
        if (fromX < this.cssWidth * 0.76 || toX < this.cssWidth * 0.76) return;
        if (Math.hypot(toX - fromX, toY - fromY) > 190) return;
        const strength = Math.min(
          this.stellarStrengths[from],
          this.stellarStrengths[to],
        );
        if (strength < 0.075) return;
        const alpha =
          Math.min(0.16, 0.018 + strength * 0.17) * constellationAmount;
        const offset = constellationVertexCount * 3;
        this.constellationData[offset] = fromX;
        this.constellationData[offset + 1] = fromY;
        this.constellationData[offset + 2] = alpha;
        this.constellationData[offset + 3] = toX;
        this.constellationData[offset + 4] = toY;
        this.constellationData[offset + 5] = alpha;
        constellationVertexCount += 2;
      });
    }

    if (constellationVertexCount > 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.constellationBuffer);
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        0,
        this.constellationData.subarray(0, constellationVertexCount * 3),
      );
      gl.useProgram(this.constellationProgram);
      gl.uniform2f(
        this.constellationUniforms.resolution,
        this.cssWidth,
        this.cssHeight,
      );
      gl.bindVertexArray(this.constellationVao);
      gl.drawArrays(gl.LINES, 0, constellationVertexCount);
    }

    const eventSparkCount = Math.min(MAX_EVENT_SPARKS, sparks.length);
    for (let index = 0; index < eventSparkCount; index += 1) {
      const spark = sparks[index];
      const offset = pointCount * POINT_STRIDE;
      this.sparkData[offset] = spark.x;
      this.sparkData[offset + 1] = spark.y;
      this.sparkData[offset + 2] = spark.size;
      this.sparkData[offset + 3] = spark.alpha;
      this.sparkData[offset + 4] = spark.warmth;
      this.sparkData[offset + 5] = index / Math.max(1, eventSparkCount);
      this.sparkData[offset + 6] = 0;
      this.sparkData[offset + 7] = 0.5;
      this.sparkData[offset + 8] = 0.5;
      pointCount += 1;
    }

    if (pointCount > 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.sparkBuffer);
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        0,
        this.sparkData.subarray(0, pointCount * POINT_STRIDE),
      );
      gl.useProgram(this.sparkProgram);
      gl.uniform2f(
        this.sparkUniforms.resolution,
        this.cssWidth,
        this.cssHeight,
      );
      gl.uniform1f(
        this.sparkUniforms.pixelRatio,
        this.pixelRatio,
      );
      gl.uniform1i(this.sparkUniforms.texture, 0);
      gl.uniform1f(this.sparkUniforms.time, time);
      gl.bindVertexArray(this.sparkVao);
      gl.drawArrays(gl.POINTS, 0, pointCount);
    }
    gl.bindVertexArray(null);
  }

  clear() {
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  destroy() {
    const gl = this.gl;
    gl.deleteBuffer(this.fillBuffer);
    gl.deleteBuffer(this.edgeBuffer);
    gl.deleteBuffer(this.sparkBuffer);
    gl.deleteBuffer(this.constellationBuffer);
    gl.deleteVertexArray(this.fillVao);
    gl.deleteVertexArray(this.edgeVao);
    gl.deleteVertexArray(this.sparkVao);
    gl.deleteVertexArray(this.constellationVao);
    gl.deleteTexture(this.texture);
    gl.deleteProgram(this.fillProgram);
    gl.deleteProgram(this.edgeProgram);
    gl.deleteProgram(this.sparkProgram);
    gl.deleteProgram(this.constellationProgram);
  }
}
