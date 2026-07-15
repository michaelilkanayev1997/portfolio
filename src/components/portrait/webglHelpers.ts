export const FRAGMENT_VERTEX_STRIDE = 9;

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

export const createProgram = (
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

export const uniform = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
) => {
  const location = gl.getUniformLocation(program, name);
  if (!location) throw new Error(`Portrait shader uniform missing: ${name}`);
  return location;
};

export type FragmentUniformLocations = {
  resolution: WebGLUniformLocation;
  portrait: WebGLUniformLocation;
  pieceTransform: WebGLUniformLocation;
  pieceFx: WebGLUniformLocation;
  texture: WebGLUniformLocation;
};

export const fragmentUniformLocations = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
): FragmentUniformLocations => ({
  resolution: uniform(gl, program, "u_resolution"),
  portrait: uniform(gl, program, "u_portrait"),
  pieceTransform: uniform(gl, program, "u_pieceTransform[0]"),
  pieceFx: uniform(gl, program, "u_pieceFx[0]"),
  texture: uniform(gl, program, "u_texture"),
});

export const configureFragmentVao = (
  gl: WebGL2RenderingContext,
  buffer: WebGLBuffer,
) => {
  const vao = gl.createVertexArray();
  if (!vao) throw new Error("Unable to create portrait vertex array");
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const stride = FRAGMENT_VERTEX_STRIDE * Float32Array.BYTES_PER_ELEMENT;
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
