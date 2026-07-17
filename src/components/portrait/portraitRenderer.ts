import type { FragmentDefinition } from "./fragmentMesh";
import {
  edgeFragmentShader,
  fillFragmentShader,
  fillVertexShader,
  MAX_PORTRAIT_FRAGMENTS,
  sparkFragmentShader,
  sparkVertexShader,
} from "./portraitShaders";
import {
  configureFragmentVao,
  createProgram,
  fragmentUniformLocations,
  FRAGMENT_VERTEX_STRIDE,
  uniform,
  type FragmentUniformLocations,
} from "./webglHelpers";

const POINT_STRIDE = 9;
const MAX_EVENT_SPARKS = 12;
const MAX_STELLAR_POINTS = MAX_PORTRAIT_FRAGMENTS + MAX_EVENT_SPARKS;

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

export class PortraitRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;
  private readonly fillProgram: WebGLProgram;
  private readonly edgeProgram: WebGLProgram;
  private readonly sparkProgram: WebGLProgram;
  private readonly fillBuffer: WebGLBuffer;
  private readonly edgeBuffer: WebGLBuffer;
  private readonly sparkBuffer: WebGLBuffer;
  private readonly fillVao: WebGLVertexArrayObject;
  private readonly edgeVao: WebGLVertexArrayObject;
  private readonly sparkVao: WebGLVertexArrayObject;
  private readonly texture: WebGLTexture;
  private readonly fragments: FragmentDefinition[];
  private readonly fillUniforms: FragmentUniformLocations & {
    time: WebGLUniformLocation;
  };
  private readonly edgeUniforms: FragmentUniformLocations & {
    time: WebGLUniformLocation;
  };
  private readonly sparkUniforms: {
    resolution: WebGLUniformLocation;
    pixelRatio: WebGLUniformLocation;
    texture: WebGLUniformLocation;
    time: WebGLUniformLocation;
  };
  private readonly transformData = new Float32Array(MAX_PORTRAIT_FRAGMENTS * 4);
  private readonly fxData = new Float32Array(MAX_PORTRAIT_FRAGMENTS * 4);
  private readonly sparkData = new Float32Array(
    POINT_STRIDE * MAX_STELLAR_POINTS,
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
    if (fragments.length > MAX_PORTRAIT_FRAGMENTS) {
      throw new Error(`Portrait fragment limit exceeded: ${fragments.length}`);
    }
    this.canvas = canvas;
    this.fragments = fragments;
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
    this.fillUniforms = {
      ...fragmentUniformLocations(gl, this.fillProgram),
      time: uniform(gl, this.fillProgram, "u_time"),
    };
    this.edgeUniforms = {
      ...fragmentUniformLocations(gl, this.edgeProgram),
      time: uniform(gl, this.edgeProgram, "u_time"),
    };
    this.sparkUniforms = {
      resolution: uniform(gl, this.sparkProgram, "u_resolution"),
      pixelRatio: uniform(gl, this.sparkProgram, "u_pixelRatio"),
      texture: uniform(gl, this.sparkProgram, "u_texture"),
      time: uniform(gl, this.sparkProgram, "u_time"),
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
    this.fillVertexCount = fillVertices.length / FRAGMENT_VERTEX_STRIDE;
    this.edgeVertexCount = edgeVertices.length / FRAGMENT_VERTEX_STRIDE;

    const fillBuffer = gl.createBuffer();
    const edgeBuffer = gl.createBuffer();
    const sparkBuffer = gl.createBuffer();
    if (!fillBuffer || !edgeBuffer || !sparkBuffer) {
      throw new Error("Unable to allocate portrait buffers");
    }
    this.fillBuffer = fillBuffer;
    this.edgeBuffer = edgeBuffer;
    this.sparkBuffer = sparkBuffer;

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
    gl.uniform1f(this.edgeUniforms.time, time);
    gl.bindVertexArray(this.edgeVao);
    gl.drawArrays(gl.LINES, 0, this.edgeVertexCount);

    this.sparkData.fill(0);
    let pointCount = 0;
    const journeyStarScale = this.cssWidth < 760 ? 1.18 : 1;

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

      const compactness = Math.max(
        0,
        Math.min(1, (0.38 - transform.scale) / 0.28),
      );
      const luminosity = Math.max(
        0,
        Math.min(1, transform.z * 0.82 + 0.08),
      );
      const strength = compactness * luminosity * transform.alpha;
      if (strength < 0.018 || pointCount >= MAX_PORTRAIT_FRAGMENTS) return;

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
        sizeVariance *
        journeyStarScale;
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

  destroy() {
    const gl = this.gl;
    gl.deleteBuffer(this.fillBuffer);
    gl.deleteBuffer(this.edgeBuffer);
    gl.deleteBuffer(this.sparkBuffer);
    gl.deleteVertexArray(this.fillVao);
    gl.deleteVertexArray(this.edgeVao);
    gl.deleteVertexArray(this.sparkVao);
    gl.deleteTexture(this.texture);
    gl.deleteProgram(this.fillProgram);
    gl.deleteProgram(this.edgeProgram);
    gl.deleteProgram(this.sparkProgram);
  }
}
