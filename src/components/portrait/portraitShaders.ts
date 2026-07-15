export const MAX_PORTRAIT_FRAGMENTS = 80;

export const fillVertexShader = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;
layout(location = 2) in vec2 a_center;
layout(location = 3) in float a_piece;
layout(location = 4) in float a_material;
layout(location = 5) in float a_seed;

uniform vec2 u_resolution;
uniform vec4 u_portrait;
uniform vec4 u_pieceTransform[${MAX_PORTRAIT_FRAGMENTS}];
uniform vec4 u_pieceFx[${MAX_PORTRAIT_FRAGMENTS}];

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

export const fillFragmentShader = `#version 300 es
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

export const edgeFragmentShader = `#version 300 es
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

export const sparkVertexShader = `#version 300 es
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

export const sparkFragmentShader = `#version 300 es
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
