/* Tiny, cached portraits rendered from the same meshes and wardrobe as the table.
   One offscreen context; GPU buffers are released after each still image. */
(function(){
'use strict';
let gl=null,program=null,canvas=null;
function initialize(){
 canvas=document.createElement('canvas');canvas.width=canvas.height=192;
 gl=canvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:true});
 if(!gl)return false;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 const vs=shader(gl.VERTEX_SHADER,'attribute vec3 position,normal;uniform mat4 vp;varying vec3 N,P;void main(){N=normal;P=position;gl_Position=vp*vec4(position,1.);}');
 const fs=shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec3 N,P;uniform vec3 color;uniform float mat;void main(){vec3 n=normalize(N),l=normalize(vec3(-.4,.65,1.)),v=normalize(vec3(0.,1.65,1.1)-P);float light=.45+.68*max(0.,dot(n,l))+.18*max(0.,dot(n,normalize(vec3(.9,.2,-.5))));vec3 c=color*light;float spec=pow(max(0.,dot(n,normalize(l+v))),mat==11.?65.:24.);c+=vec3(spec*(mat==11.?.28:.05));gl_FragColor=vec4(pow(max(c,vec3(0.)),vec3(.4545)),1.);}');
 program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return false;
 gl.useProgram(program);gl.enable(gl.DEPTH_TEST);return true;
}
const unit=v=>{const d=Math.hypot(...v);return v.map(n=>n/d)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,n,i)=>s+n*b[i],0);
function matrix(eye,target){const z=unit(eye.map((v,i)=>v-target[i])),x=unit(cross([0,1,0],z)),y=cross(z,x),view=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1],f=1/Math.tan(.30),near=.04,far=10,p=[f,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0],out=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=p[k*4+r]*view[c*4+k];return out}
function render(index,look){
 try{
  if(!gl&&!initialize())return '';
  const objects=[],set=HoldEmCast((data,color,mat)=>objects.push({data,color,mat}),{chosen:index,mode:'portrait',customizations:{[index]:look}}),head=set.actors[0].headY;
  gl.useProgram(program);gl.viewport(0,0,192,192);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(gl.getUniformLocation(program,'vp'),false,matrix([.025,head-.03,1.06],[0,head-.03,0]));
  const position=gl.getAttribLocation(program,'position'),normal=gl.getAttribLocation(program,'normal');gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(normal);
  for(const o of objects){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(o.data),gl.STATIC_DRAW);gl.vertexAttribPointer(position,3,gl.FLOAT,false,32,0);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,32,12);gl.uniform3fv(gl.getUniformLocation(program,'color'),o.color);gl.uniform1f(gl.getUniformLocation(program,'mat'),o.mat??7);gl.drawArrays(gl.TRIANGLES,0,o.data.length/8);gl.deleteBuffer(buffer)}
  return canvas.toDataURL('image/png');
 }catch(e){console.warn('Hold Em portrait:',e.message);return ''}
}
window.HoldEmPortraits={render};
window.addEventListener('pagehide',()=>{if(gl){gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();gl=null}});
})();
