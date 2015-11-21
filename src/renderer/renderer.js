

var THREE = require('../lib/three.min.js');

var Box      = require('../entity/box');
var Cylinder = require('../entity/cylinder');
var Sphere   = require('../entity/sphere');
var Capsule  = require('../entity/capsule');
var Plane    = require('../entity/plane');

function Renderer() {

    this.initializeGL();
    this.initializeWorld();
    this.initializeDiv();

    this.entities = {};
    this.joints = {};
}


Renderer.prototype.constructor = Renderer;

Renderer.prototype.initializeGL = function() {

    try{
        this.renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
        this.renderType = 'webgl';
    }catch(e){
        try{
            this.renderer = new THREE.CanvasRenderer();
            this.renderType = 'canvas';
        }catch(e2){
            throw 'Could not initialize Renderer';
            return;
        }
    }
    this.error = false;

    this.renderer.setClearColor(0xffffff, 1);
};

Renderer.prototype.initializeWorld = function() {

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0, 2000);
//    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 2000);
    this.scene.add(this.camera);
    this.light = new THREE.PointLight( 0xfffffa, 1, 0 );
    this.light.position.set(20,20,20);
    this.scene.add( this.light );

    this.camera.position.x = 0;
    this.camera.position.y = 1;
    this.camera.position.z = 10;
    this.camera.lookAt(new THREE.Vector3(0,1,0));

};

Renderer.prototype.initializeDiv = function() {

    /*
    this.panel = $('<div>')
        .addClass('threeworld')
        .attr({tabindex:0})
        .css({
            position: 'absolute',
            width: 400,
            height: 400,
        });
    */
    this.panel = $('<div>')
        .addClass('threeContext')
        .attr({tabindex:0});

    this.renderer.setSize(400,400);

    this.canvas = $(this.renderer.domElement).width(400).height(400).addClass("threeCanvas");
    $(this.panel).append(this.canvas);
};

Renderer.prototype.setSize = function() {

    var w = $('#simbicon').width();
    var h = $('#simbicon').height();

    this.canvas.width(w);
    this.canvas.height(h);

    this.renderer.setSize(w, h);

    this.camera.aspect = w/h;
    this.camera.updateProjectionMatrix();

//    this.panel.css({width: w, height: h});
};

Renderer.prototype.render = function() {
    this.updateEntities();
    this.renderer.render(this.scene, this.camera);
};


Renderer.prototype.updateEntities = function() {

    for (var name in this.entities) {
        var entity = this.entities[name].entity;
        var obj = this.entities[name].object;

        obj.position.x = entity.position[0];
        obj.position.y = entity.position[1];
        obj.position.z = entity.position[2];

        obj.rotation.setFromQuaternion(new THREE.Quaternion(entity.rotation[0], entity.rotation[1], entity.rotation[2], entity.rotation[3]));
    }
    for (var name in this.joints) {

        var joint = this.joints[name].joint;
        var obj = this.joints[name].object;

        obj.position.x = joint.position[0];
        obj.position.y = joint.position[1];
        obj.position.z = joint.position[2];

    }
};

Renderer.prototype.addCylinder = function(e) {
    var c = e.color;
    var cstring = 'rgb(' + c[0] + ','+ c[1]  + ',' + c[2]  + ')';
//    var cstring = 'rgb(255,0,0)';
    var color = new THREE.Color(cstring);

    var cylinder = new THREE.Object3D();

    var cyl_geo = new THREE.CylinderGeometry(e.getRadius(), e.getRadius(), e.getHeight(), 32, 4, false);

    var mat = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: cstring, specular: 0x030303, shininess: 10, shading: THREE.SmoothShading} );

    var cyl_mesh = new THREE.Mesh( cyl_geo , mat );

    cylinder.add(cyl_mesh);

    return cylinder;

};

Renderer.prototype.addCapsule = function(e) {
    var c = e.color;
    var cstring = 'rgb(' + c[0] + ','+ c[1]  + ',' + c[2]  + ')';
//    var cstring = 'rgb(255,0,0)';
    var color = new THREE.Color(cstring);

    var capsule = new THREE.Object3D();

    var cyl_geo = new THREE.CylinderGeometry(e.getRadius(), e.getRadius(), e.getHeight(), 32, 4, true);

    var sph_geo= new THREE.SphereGeometry(e.getRadius(), 32, 32);
    var mat = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: cstring, specular: 0x030303, shininess: 10, shading: THREE.SmoothShading} );

    var cyl_mesh = new THREE.Mesh( cyl_geo , mat );
    var top_mesh = new THREE.Mesh( sph_geo , mat );
    var btm_mesh = new THREE.Mesh( sph_geo , mat );

    top_mesh.position.y = e.getHeight()/2.;
    btm_mesh.position.y = -e.getHeight()/2.;

    capsule.add(cyl_mesh);
    capsule.add(top_mesh);
    capsule.add(btm_mesh);

    return capsule;

};

Renderer.prototype.addSphere = function(e) {

    var c = e.color;
    var cstring = 'rgb(' + c[0] + ','+ c[1]  + ',' + c[2]  + ')';
//    var cstring = 'rgb(255,0,0)';
    var color = new THREE.Color(cstring);

    var obj3 = new THREE.Object3D();

    var geo = new THREE.SphereGeometry(e.getRadius(), 32, 32);

    var mat = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: cstring, specular: 0x030303, shininess: 10, shading: THREE.SmoothShading} );
    var mesh = new THREE.Mesh( geo , mat );

    obj3.add(mesh);

    return obj3;

};

Renderer.prototype.addBox = function(e) {

    var c = e.color;
    var cstring = 'rgb(' + c[0] + ','+ c[1]  + ',' + c[2]  + ')';
//    var cstring = 'rgb(255,0,0)';
    var color = new THREE.Color(cstring);

    var obj3 = new THREE.Object3D();

    var sides = e.getSides();
    var geo = new THREE.BoxGeometry(sides[0], sides[1], sides[2]);

    var mat = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: cstring, specular: 0x030303, shininess: 10, shading: THREE.SmoothShading} );
    var mesh = new THREE.Mesh( geo , mat );

    obj3.add(mesh);

    return obj3;

};

Renderer.prototype.addJoint = function(j) {

    var entity = {color: [255, 170, 0], getRadius: function() { return .06; }};
    var obj = this.addSphere(entity);

    this.scene.add(obj);
    this.joints[j.name] = {'object': obj, 'joint': j};
};

Renderer.prototype.addEntity = function(e) {
    
    var name = e.name;
    if (name in this.entities) {
        console.error('Cannot add entity. Entity with name ' + name + 'already exists.');
        return -1;
    }

    var obj;

    switch (e.getType()) {
        case 'SPHERE':
            obj = this.addSphere(e);
            break;
        case 'BOX':
            obj = this.addBox(e);
            break;
        case 'CAPSULE':
            obj = this.addCapsule(e);
            break;
        case 'CYLINDER':
            obj = this.addCylinder(e);
            break;
        default:
            break;
    }

    this.scene.add(obj);

    this.entities[e.name] = {'entity': e, 'object': obj};

};

module.exports = Renderer;
