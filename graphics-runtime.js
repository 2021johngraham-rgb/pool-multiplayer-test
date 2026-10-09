/* Shared surface library: one baked, mipmapped texture per WebGL context. */
(() => {
  'use strict';
  let pixels;
  const extensions = new WeakMap();
  function surfacePixels() {
    if (pixels) return pixels;
    const size = 256, field = new Float32Array(size * size);
    let seed = 194703;
    for (let i = 0; i < field.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      field[i] = seed / 4294967296;
    }
    const sample = (x, y, period) => {
      const ix = Math.floor(x), iy = Math.floor(y);
      let u = x - ix, v = y - iy;
      u = u * u * (3 - 2 * u); v = v * v * (3 - 2 * v);
      const mask = period - 1;
      const a = field[(iy & mask) * size + (ix & mask)];
      const b = field[(iy & mask) * size + ((ix + 1) & mask)];
      const c = field[((iy + 1) & mask) * size + (ix & mask)];
      const d = field[((iy + 1) & mask) * size + ((ix + 1) & mask)];
      return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
    };
    pixels = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      pixels[i] = field[y * size + x] * 255;
      pixels[i + 1] = (sample(x / 4, y / 4, 64) * .58 + sample(x / 2, y / 2, 128) * .28 + sample(x, y, 256) * .14) * 255;
      pixels[i + 2] = (0.5 + .22 * Math.cos(x * Math.PI) * Math.cos(y * Math.PI) + field[y * size + x] * .1) * 255;
      pixels[i + 3] = 255;
    }
    return pixels;
  }
  function filter(gl, mipmaps = true, anisotropy = 4) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    if (!extensions.has(gl)) extensions.set(gl, gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic'));
    const ext = extensions.get(gl);
    if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(anisotropy, gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  }
  function install(gl, program) {
    gl.activeTexture(gl.TEXTURE2);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, surfacePixels());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D); filter(gl);
    gl.uniform1i(gl.getUniformLocation(program, 'uSurfaceTexture'), 2);
    gl.activeTexture(gl.TEXTURE0);
    return texture;
  }
  const planes = new Float32Array(24);
  let hasView = false;
  function setView(m) {
    hasView = true;
    for (let side = 0; side < 6; side++) {
      const axis = side >> 1, sign = side % 2 ? -1 : 1, k = side * 4;
      for (let c = 0; c < 4; c++) planes[k + c] = m[c * 4 + 3] + sign * m[c * 4 + axis];
      const scale = 1 / Math.hypot(planes[k], planes[k + 1], planes[k + 2]);
      for (let c = 0; c < 4; c++) planes[k + c] *= scale;
    }
  }
  function visible(x, y, z, radius) {
    if (!hasView) return true;
    for (let k = 0; k < 24; k += 4) if (planes[k] * x + planes[k + 1] * y + planes[k + 2] * z + planes[k + 3] < -radius) return false;
    return true;
  }
  window.GameSurface = { install, filter, setView, visible };
})();
