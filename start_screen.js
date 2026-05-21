import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export function initStartScreen(scene) {
    const startGroup = new THREE.Group();
    
    // 조명 추가
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(0, 10, 10);
    startGroup.add(ambientLight, dirLight);

    // 3D 텍스트 로고 생성
    const fontLoader = new FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
        const textGeo = new TextGeometry('AKARHYTHM', {
            font: font, size: 5, height: 1.5,
            curveSegments: 12, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.1
        });
        
        // 로고 중앙 정렬
        textGeo.computeBoundingBox();
        const centerOffset = - 0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
        
        // 연세대 남색 & 흰색 재질
        const material = new THREE.MeshStandardMaterial({ color: 0x000080, metalness: 0.3, roughness: 0.2 });
        const textMesh = new THREE.Mesh(textGeo, material);
        
        textMesh.position.set(centerOffset, 5, 0);
        startGroup.add(textMesh);
        
        // 애니메이션을 위한 userData 추가
        startGroup.userData.logo = textMesh; 
    });

    scene.add(startGroup);
    return startGroup;
}