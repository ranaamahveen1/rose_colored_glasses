import React, { useEffect, useRef } from 'react';

const initialize = (canvas) => {
    const frag = window.frag;
    frag.canvas = canvas;
    frag.init();
    return frag;
};

const setupScene = (frag) => {
    const camera = frag.UiCamera().scaleX(100);
    const scene = frag.Scene().camera(camera);
    frag.mainScene(scene);
    return scene;
}

const buildPhotoShader = (frag) => {
    const gl = frag.gl;

    const shader = {
        name: "Photo",
        attributes: {},
        uniforms: {},
        is3d: false,
        _color: [0.5, 0.5, 0.5],
    };

    shader.vSource =
        'attribute vec2 a_position;\n' +
        'attribute vec2 a_texcoord;\n' +
        'uniform mat3 u_clipMatrix\n;' +
        'uniform vec3 u_color;\n' +
        'varying vec2 v_texcoord;\n' +
        'varying vec3 v_color;\n' +

        'vec3 rgb2hsv(vec3 c)\n' +
        '{\n' +
        '  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n' +
        '  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n' +
        '  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n' +
        '  \n' +
        '  float d = q.x - min(q.w, q.y);\n' +
        '  float e = 1.0e-10;\n' +
        '  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n' +
        '}\n' +

        'void main() {\n' +
        '  vec2 position = a_position;\n' +
        '  position = (u_clipMatrix * vec3(position, 1)).xy;\n' +
        '  gl_Position = vec4(position, 0, 1);\n' +
        '  v_texcoord = vec2(a_texcoord.x, 1.0 - a_texcoord.y);\n' +
        '  v_color = rgb2hsv(u_color);\n' +
        '}';

    shader.fSource =
        'precision mediump float;\n' +
        'uniform sampler2D u_photo;\n' +
        'uniform sampler2D u_mask;\n' +
        'varying vec2 v_texcoord;\n' +
        'varying vec3 v_color;\n' +

        'vec3 rgb2hsv(vec3 c)\n' +
        '{\n' +
        '  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n' +
        '  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n' +
        '  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n' +
        '  \n' +
        '  float d = q.x - min(q.w, q.y);\n' +
        '  float e = 1.0e-10;\n' +
        '  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n' +
        '}\n' +

        'vec3 hsv2rgb(vec3 c)\n' +
        '{\n' +
        '  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n' +
        '  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n' +
        '  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n' +
        '}\n' +

        'void main() {\n' +
        '  vec3 photoPixel = texture2D(u_photo, v_texcoord).rgb;\n' +
        '  vec3 maskPixel = texture2D(u_mask, v_texcoord).rgb;\n' +
        '  vec3 photoPixelHsv = rgb2hsv(photoPixel);\n' +
        '  vec3 recoloredPixelHsv = vec3(v_color.x, v_color.y, photoPixelHsv.z);\n' +
        '  vec3 recoloredPixel = hsv2rgb(recoloredPixelHsv);\n' +
        '  gl_FragColor = vec4(mix(photoPixel, recoloredPixel, maskPixel.r), 1);\n' +
        '}\n';

    const vertexShader = frag.createShader(shader.name, gl.VERTEX_SHADER, shader.vSource);
    const fragmentShader = frag.createShader(shader.name, gl.FRAGMENT_SHADER, shader.fSource);
    shader.program = frag.createProgram(shader.name, vertexShader, fragmentShader);

    if (!shader.program) return null;

    const bindList = [];
    const unbindList = [];

    shader.attributes.position = gl.getAttribLocation(shader.program, "a_position");
    shader.attributes.texture = gl.getAttribLocation(shader.program, "a_texcoord");
    shader.uniforms.photo = gl.getUniformLocation(shader.program, "u_photo");
    shader.uniforms.mask = gl.getUniformLocation(shader.program, "u_mask");
    shader.uniforms.clipMatrix = gl.getUniformLocation(shader.program, "u_clipMatrix");

    shader.uniforms.color = frag.gl.getUniformLocation(shader.program, "u_color");
    if (shader.uniforms.color)
        bindList.push(function (gl) { gl.uniform3fv(shader.uniforms.color, shader._color); });

    shader.color = function (color) {
        shader._color = color;
        return shader;
    };

    shader.bind = function (gl) {
        gl.useProgram(shader.program);
        bindList.forEach(f => f(gl));
    }

    shader.unbind = function (gl) {
        unbindList.forEach(f => f(gl));
    }

    return shader;
}

const addPhotoToScene = (frag, scene, shader, image, mask) => {
    const photoTexture = frag.Texture()
        .name('photo')
        .fromImage(0, image);

    const maskTexture = frag.Texture()
        .name('mask')
        .fromImage(0, mask);

    const photoMaterial = frag.Material()
        .name('photo')
        .setTexture('photo', photoTexture)
        .setTexture('mask', maskTexture)
        .disposeTextures(false);

    const photoModel = frag.Model(false)
        .name('photo')
        .mesh(frag.Plane(1).name('photo'))
        .material(photoMaterial)
        .shader(shader);

    const photoObject = frag.SceneObject(photoModel)
    scene.addObject(photoObject);

    photoObject.getPosition().scale(100);

    return photoObject;
}

export const RecoloredPhoto = (props) => {
    const { photoUrl, maskUrl, color, onImageChanged, ...other } = props;

    const canvas = useRef();

    const frag = useRef();
    const scene = useRef();
    const photoShader = useRef();

    const photoImage = useRef();
    const maskImage = useRef();

    useEffect(() => {
        frag.current = initialize(canvas.current);
        scene.current = setupScene(frag.current);
        photoShader.current = buildPhotoShader(frag.current);
    }, [])

    useEffect(() => {
        if (!photoImage.current) {
            photoImage.current = new Image();
            photoImage.current.crossOrigin = '';
            maskImage.current = new Image();
            maskImage.current.crossOrigin = '';
            addPhotoToScene(frag.current, scene.current, photoShader.current, photoImage.current, maskImage.current);
        }
        photoImage.current.src = photoUrl;
        maskImage.current.src = maskUrl;

        if (onImageChanged) {
            const image = new Image();
            image.src = photoUrl;
            image.crossOrigin = '';
            image.onload = () => {
                onImageChanged(image.width, image.height);
            }
        }
    }, [photoUrl, maskUrl]);

    useEffect(() => {
        if (color) photoShader.current.color(color);
    }, [color]);

    return (
        <canvas ref={canvas} {...other}/>
    );
};

export default RecoloredPhoto;
