/* Cached, packed-depth shadows. One small map, refreshed only as the cast moves. */
window.HoldEmLighting=function(gl){
 const size=1024;
 function compile(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null}return s}
 const v=compile(gl.VERTEX_SHADER,'attribute vec3 p;attribute vec2 uv;uniform mat4 lightVP,pose,forePose;uniform vec3 armElbow,armAxis;uniform float articulated;uniform vec2 blink;varying vec2 tex;void main(){vec3 q=p;q.y=mix(q.y,blink.x,blink.y);tex=uv;float w=articulated*smoothstep(-.024,.024,dot(q-armElbow,armAxis));gl_Position=lightVP*mix(pose*vec4(q,1.),forePose*vec4(q,1.),w);}');
 const f=compile(gl.FRAGMENT_SHADER,'precision highp float;uniform sampler2D image;uniform float cutout;varying vec2 tex;void main(){if(cutout>.5&&texture2D(image,tex).a<.1)discard;vec4 d=fract(gl_FragCoord.z*vec4(16777216.,65536.,256.,1.));d-=d.xxyz*vec4(0.,1./256.,1./256.,1./256.);gl_FragColor=d;}');
 if(!v||!f)return {enabled:false};
 const program=gl.createProgram();gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);return {enabled:false}}
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,size,size,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const depth=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,size,size);
 const buffer=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,buffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);
 const enabled=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;gl.bindFramebuffer(gl.FRAMEBUFFER,null);
 const white=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,white);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
 const uniforms={};for(const k of ['lightVP','pose','forePose','armElbow','armAxis','articulated','blink','image','cutout'])uniforms[k]=gl.getUniformLocation(program,k);
 const position=gl.getAttribLocation(program,'p'),uv=gl.getAttribLocation(program,'uv'),attributeCount=gl.getParameter(gl.MAX_VERTEX_ATTRIBS),identity=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
 function render(lists,motion,matrix,resolver=null,armResolver=null){
  if(!enabled)return;
  const dither=gl.isEnabled(gl.DITHER);gl.disable(gl.DITHER);
  for(let i=0;i<attributeCount;i++)if(i!==position&&i!==uv)gl.disableVertexAttribArray(i);
  gl.bindFramebuffer(gl.FRAMEBUFFER,buffer);gl.viewport(0,0,size,size);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.uniformMatrix4fv(uniforms.lightVP,false,matrix);gl.uniform1i(uniforms.image,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,white);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1.5,2.);
  for(const list of lists)for(const o of list){
   if(o.mat===12||o.mat===13||o.mat===6||resolver&&resolver(o)===false)continue;
   const state=o.rig?motion?.states.get(o.rig.actor):null,articulated=o.rig&&(o.rig.part==='head'||o.rig.part==='eyes');
   gl.uniformMatrix4fv(uniforms.pose,false,resolver&&resolver(o)||(state&&articulated?state.pose:identity));gl.uniform2f(uniforms.blink,o.rig?.eyeY||0,o.rig?.part==='eyes'&&state?state.blink:0);
   const arm=armResolver?.(o);gl.uniformMatrix4fv(uniforms.forePose,false,arm?.lower||identity);gl.uniform3fv(uniforms.armElbow,arm?.elbow||[0,0,0]);gl.uniform3fv(uniforms.armAxis,arm?.axis||[0,1,0]);gl.uniform1f(uniforms.articulated,arm?1:0);
   gl.uniform1f(uniforms.cutout,o.texture?1:0);if(o.texture)gl.bindTexture(gl.TEXTURE_2D,o.texture);
   gl.bindBuffer(gl.ARRAY_BUFFER,o.b);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,3,gl.FLOAT,false,32,0);gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,32,24);gl.drawArrays(gl.TRIANGLES,0,o.count);
  }
  gl.disable(gl.POLYGON_OFFSET_FILL);gl.bindFramebuffer(gl.FRAMEBUFFER,null);if(dither)gl.enable(gl.DITHER);
 }
 return {enabled,texture,size,render};
};
