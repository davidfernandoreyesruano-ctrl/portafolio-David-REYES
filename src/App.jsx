import {
  Canvas,
  useThree,
  useFrame,
} from '@react-three/fiber'

import {
  useGLTF,
} from '@react-three/drei'

import {
  EffectComposer,
  Bloom,
  Vignette,
} from '@react-three/postprocessing'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import * as THREE from 'three'

const REDES_URL =
  'https://www.youtube.com/@Up-Pro-fd2bo'

const REDES_SOCIALES = [
  'Sketchfab_model.030',
  'Sketchfab_model.031',
  'Sketchfab_model.049',
]


// =====================================================
// AJUSTE DE PÁGINA
// =====================================================

function AjustePagina() {

  useEffect(() => {

    document.body.style.margin = '0'
    document.body.style.overflow = 'hidden'
    document.body.style.background = '#020308'

    return () => {

      document.body.style.margin = ''
      document.body.style.overflow = ''
      document.body.style.background = ''

    }

  }, [])

  return null
}


// =====================================================
// MATERIAL DEL SUELO
// =====================================================

function ConfigurarSuelo({ suelo }) {

  useEffect(() => {

    if (!suelo) return

    const material =
      new THREE.MeshStandardMaterial({

        color: '#05070A',

        metalness: 0.78,

        roughness: 0.28,

        envMapIntensity: 1.2,

        side: THREE.DoubleSide,

      })

    const materialAnterior =
      suelo.material

    suelo.material =
      material

    suelo.receiveShadow =
      true

    return () => {

      suelo.material =
        materialAnterior

      material.dispose()

    }

  }, [suelo])

  return null
}


// =====================================================
// PARTICULAS AMBIENTALES
// =====================================================

function ParticulasAmbientales() {

  const puntos =
    useRef(null)

  const [objeto, setObjeto] =
    useState(null)

  const cantidad = 0

  useEffect(() => {

    const posiciones =
      new Float32Array(
        cantidad * 3
      )

    for (
      let i = 0;
      i < cantidad;
      i++
    ) {

      posiciones[i * 3] =
        (Math.random() - 0.5) * 24

      posiciones[i * 3 + 1] =
        3 + Math.random() * 10

      posiciones[i * 3 + 2] =
        (Math.random() - 0.5) * 24

    }

    const geometry =
      new THREE.BufferGeometry()

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        posiciones,
        3
      )
    )

    const material =
      new THREE.PointsMaterial({

        color: '#6DEBFF',

        size: 0.025,

        transparent: true,

        opacity: 0.42,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending,

        sizeAttenuation: true,

      })

    const objetoNuevo =
      new THREE.Points(
        geometry,
        material
      )

    puntos.current =
      objetoNuevo

    setObjeto(
      objetoNuevo
    )

    return () => {

      geometry.dispose()

      material.dispose()

      puntos.current = null

      setObjeto(null)

    }

  }, [])


  useFrame((state) => {

    if (!puntos.current) {
      return
    }

    const posiciones =
      puntos.current
        .geometry
        .attributes
        .position

    const tiempo =
      state.clock.elapsedTime

    for (
      let i = 0;
      i < cantidad;
      i++
    ) {

      const indice =
        i * 3

      const x =
        posiciones.array[indice]

      const y =
        posiciones.array[
          indice + 1
        ]

      const z =
        posiciones.array[
          indice + 2
        ]

      posiciones.array[indice] =
        x +
        Math.sin(
          tiempo * 0.25 + i
        ) *
        0.0008

      posiciones.array[
        indice + 1
      ] =
        y +
        Math.sin(
          tiempo * 0.35 +
          i * 0.7
        ) *
        0.001

      posiciones.array[
        indice + 2
      ] =
        z +
        Math.cos(
          tiempo * 0.22 + i
        ) *
        0.0008

    }

    posiciones.needsUpdate =
      true

    puntos.current.rotation.y =
      tiempo * 0.008

  })


  if (!objeto) {
    return null
  }

  return (
    <primitive
      object={objeto}
    />
  )
}


// =====================================================
// HOLOGRAMA DE CABEZA
// =====================================================

function PuntosHolograma({
  cabeza,
}) {

  const puntos =
    useRef(null)

  const material =
    useRef(null)

  const creado =
    useRef(false)

  const posicionesBase =
    useRef(null)

  const velocidades =
    useRef(null)

  const fases =
    useRef(null)

  const amplitudes =
    useRef(null)

  const posicionInicial =
    useRef(
      new THREE.Vector3()
    )

  const rotacionInicial =
    useRef(
      new THREE.Euler()
    )


  useEffect(() => {

    if (
      !cabeza ||
      !cabeza.geometry ||
      creado.current
    ) {
      return
    }

    creado.current = true

    cabeza.visible = false

    posicionInicial.current.copy(
      cabeza.position
    )

    rotacionInicial.current.copy(
      cabeza.rotation
    )

    const posicion =
      cabeza.geometry
        .attributes
        .position

    if (!posicion) {

      creado.current = false

      cabeza.visible = true

      return
    }


    // =================================================
    // MAYOR DENSIDAD
    // =================================================

    const cantidad =
      Math.min(
        90000,
        posicion.count
      )

    const posiciones =
      new Float32Array(
        cantidad * 3
      )

    const base =
      new Float32Array(
        cantidad * 3
      )

    const velocidadesParticula =
      new Float32Array(
        cantidad
      )

    const fasesParticula =
      new Float32Array(
        cantidad
      )

    const amplitudesParticula =
      new Float32Array(
        cantidad
      )


    // =================================================
    // CREAR NUBE ESTABLE
    // =================================================

    for (
      let i = 0;
      i < cantidad;
      i++
    ) {

      const indice =
        Math.floor(
          Math.random() *
          posicion.count
        )

      const x =
        posicion.getX(indice)

      const y =
        posicion.getY(indice)

      const z =
        posicion.getZ(indice)

      const direccion =
        new THREE.Vector3(
          x,
          y,
          z
        )

      if (
        direccion.lengthSq() > 0
      ) {

        direccion.normalize()

      } else {

        direccion.set(
          0,
          1,
          0
        )

      }


      // Menor dispersión para conservar
      // mejor la silueta original.

      const separacion =
        Math.pow(
          Math.random(),
          90
        ) *
        0.955


      const px =
        x +
        direccion.x *
        separacion

      const py =
        y +
        direccion.y *
        separacion

      const pz =
        z +
        direccion.z *
        separacion


      posiciones[i * 3] =
        px

      posiciones[i * 3 + 1] =
        py

      posiciones[i * 3 + 2] =
        pz


      base[i * 3] =
        px

      base[i * 3 + 1] =
        py

      base[i * 3 + 2] =
        pz


      velocidadesParticula[i] =
        0.25 +
        Math.random() *
        1


      fasesParticula[i] =
        Math.random() *
        Math.PI *
        2


      amplitudesParticula[i] =
        0.01 +
        Math.random() *
        0.01

    }


    posicionesBase.current =
      base

    velocidades.current =
      velocidadesParticula

    fases.current =
      fasesParticula

    amplitudes.current =
      amplitudesParticula


    // =================================================
    // GEOMETRIA
    // =================================================

    const geometry =
      new THREE.BufferGeometry()

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        posiciones,
        3
      )
    )


    // =================================================
    // MATERIAL
    // =================================================

    const mat =
      new THREE.PointsMaterial({

        color: '#49E2FF',

        size: 0.0001,

        transparent: true,

        opacity: 0.18,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending,

        sizeAttenuation: true,

      })

    material.current =
      mat


    // =================================================
    // PUNTOS
    // =================================================

    const puntosNuevo =
      new THREE.Points(
        geometry,
        mat
      )

    puntos.current =
      puntosNuevo

    puntosNuevo.position.copy(
      cabeza.position
    )

    puntosNuevo.rotation.copy(
      cabeza.rotation
    )

    puntosNuevo.scale.copy(
      cabeza.scale
    )

    puntosNuevo.renderOrder =
      30


    if (cabeza.parent) {

      cabeza.parent.add(
        puntosNuevo
      )

    }


    return () => {

      cabeza.visible = true

      if (
        puntos.current &&
        cabeza.parent
      ) {

        cabeza.parent.remove(
          puntos.current
        )

      }

      geometry.dispose()

      mat.dispose()

      puntos.current = null

      material.current = null

      posicionesBase.current =
        null

      velocidades.current =
        null

      fases.current =
        null

      amplitudes.current =
        null

      creado.current = false

    }

  }, [cabeza])


  // ===================================================
  // ANIMACION
  // ===================================================

  useFrame((state) => {

    if (
      !puntos.current ||
      !material.current ||
      !posicionesBase.current ||
      !velocidades.current ||
      !fases.current ||
      !amplitudes.current
    ) {
      return
    }

    const tiempo =
      state.clock.elapsedTime

    const posiciones =
      puntos.current
        .geometry
        .attributes
        .position

    const base =
      posicionesBase.current

    const velocidadesParticula =
      velocidades.current

    const fasesParticula =
      fases.current

    const amplitudesParticula =
      amplitudes.current


    // =================================================
    // PARTICULAS
    // Movimiento reducido para conservar definición.
    // =================================================

    for (
      let i = 0;
      i <
      velocidadesParticula.length;
      i++
    ) {

      const indice =
        i * 3

      const fase =
        fasesParticula[i]

      const velocidad =
        velocidadesParticula[i]

      const amplitud =
        amplitudesParticula[i]


      const movimientoX =
        Math.sin(
          tiempo *
          velocidad *
          0.45 +
          fase
        ) *
        amplitud


      const movimientoY =
        Math.sin(
          tiempo *
          velocidad *
          0.45 *
          0.7 +
          fase *
          1.7
        ) *
        amplitud *
        0.8


      const movimientoZ =
        Math.cos(
          tiempo *
          velocidad *
          0.8 +
          fase
        ) *
        amplitud


      posiciones.array[indice] =
        base[indice] +
        movimientoX

      posiciones.array[
        indice + 1
      ] =
        base[indice + 1] +
        movimientoY

      posiciones.array[
        indice + 2
      ] =
        base[indice + 2] +
        movimientoZ

    }


    posiciones.needsUpdate =
      true


    // =================================================
    // MOVIMIENTO VERTICAL
    // =================================================

    const movimientoVertical =
      Math.sin(
        tiempo * 0.65
      ) *
      0.10

    puntos.current.position.y =
      posicionInicial.current.y +
      movimientoVertical


    // =================================================
    // ROTACION
    // =================================================

    puntos.current.rotation.y =
      rotacionInicial.current.y +
      Math.sin(
        tiempo * 0.65
      ) *
      0.06


    puntos.current.rotation.x =
      rotacionInicial.current.x +
      Math.sin(
        tiempo * 0.65
      ) *
      0.12


    // =================================================
    // FLICKER MUY SUTIL
    // =================================================

    material.current.opacity =
      0.86 +
      Math.sin(
        tiempo * 4
      ) *
      0.025

    material.current.size =
      0.014 +
      Math.sin(
        tiempo * 3
      ) *
      0.0005

  })


  return null
}


// =====================================================
// HOLOGRAMA "sj"
// SOLO AFECTA EXACTAMENTE AL OBJETO "sj"
// =====================================================

function HologramaSJ({
  objeto,
}) {

  const puntos =
    useRef(null)

  const material =
    useRef(null)

  const creado =
    useRef(false)

  const posicionesBase =
    useRef(null)

  const velocidades =
    useRef(null)

  const fases =
    useRef(null)

  const amplitudes =
    useRef(null)

  const posicionInicial =
    useRef(
      new THREE.Vector3()
    )


  useEffect(() => {

    if (
      !objeto ||
      !objeto.geometry ||
      creado.current
    ) {
      return
    }

    creado.current = true

    posicionInicial.current.copy(
      objeto.position
    )

    // Ocultar objeto sólido.
    objeto.visible = false


    const posicion =
      objeto.geometry
        .attributes
        .position


    if (!posicion) {

      creado.current = false

      objeto.visible = true

      return
    }


    // =================================================
    // ALTA DENSIDAD
    // MUY POCA DISPERSION PARA MEJOR LEGIBILIDAD
    // =================================================

    const cantidad =
      Math.min(
        42000,
        posicion.count
      )

    const posiciones =
      new Float32Array(
        cantidad * 3
      )

    const base =
      new Float32Array(
        cantidad * 3
      )

    const velocidadesParticula =
      new Float32Array(
        cantidad
      )

    const fasesParticula =
      new Float32Array(
        cantidad
      )

    const amplitudesParticula =
      new Float32Array(
        cantidad
      )


    for (
      let i = 0;
      i < cantidad;
      i++
    ) {

      const indice =
        Math.floor(
          Math.random() *
          posicion.count
        )

      const x =
        posicion.getX(indice)

      const y =
        posicion.getY(indice)

      const z =
        posicion.getZ(indice)


      const direccion =
        new THREE.Vector3(
          x,
          y,
          z
        )


      if (
        direccion.lengthSq() > 0
      ) {

        direccion.normalize()

      } else {

        direccion.set(
          0,
          1,
          0
        )

      }


      // DISPERSION CASI NULA.
      // LA PRIORIDAD ES CONSERVAR LA FORMA
      // ORIGINAL DEL TEXTO/OBJETO.

      const separacion =
        Math.pow(
          Math.random(),
          6.5
        ) *
        0.015


      const px =
        x +
        direccion.x *
        separacion

      const py =
        y +
        direccion.y *
        separacion

      const pz =
        z +
        direccion.z *
        separacion


      posiciones[i * 3] =
        px

      posiciones[i * 3 + 1] =
        py

      posiciones[i * 3 + 2] =
        pz


      base[i * 3] =
        px

      base[i * 3 + 1] =
        py

      base[i * 3 + 2] =
        pz


      velocidadesParticula[i] =
        0.35 +
        Math.random() *
        0.8


      fasesParticula[i] =
        Math.random() *
        Math.PI *
        2


      // MOVIMIENTO CASI NULO.
      // EVITA QUE LAS LETRAS SE DESARMEN.

      amplitudesParticula[i] =
        0.00015 +
        Math.random() *
        0.00075

    }


    posicionesBase.current =
      base

    velocidades.current =
      velocidadesParticula

    fases.current =
      fasesParticula

    amplitudes.current =
      amplitudesParticula


    // =================================================
    // GEOMETRIA
    // =================================================

    const geometry =
      new THREE.BufferGeometry()

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        posiciones,
        3
      )
    )


    // =================================================
    // MATERIAL
    // EMISION REDUCIDA
    // =================================================

    const mat =
      new THREE.PointsMaterial({

        color: '#55E8FF',

        size: 0.0085,

        transparent: true,

        opacity: 0.56,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending,

        sizeAttenuation: true,

      })


    material.current =
      mat


    const puntosNuevo =
      new THREE.Points(
        geometry,
        mat
      )


    puntos.current =
      puntosNuevo


    puntosNuevo.position.copy(
      objeto.position
    )

    puntosNuevo.rotation.copy(
      objeto.rotation
    )

    puntosNuevo.scale.copy(
      objeto.scale
    )

    puntosNuevo.renderOrder =
      25


    if (objeto.parent) {

      objeto.parent.add(
        puntosNuevo
      )

    }


    return () => {

      objeto.visible = true

      if (
        puntos.current &&
        objeto.parent
      ) {

        objeto.parent.remove(
          puntos.current
        )

      }


      geometry.dispose()

      mat.dispose()

      puntos.current = null

      material.current = null

      posicionesBase.current =
        null

      velocidades.current =
        null

      fases.current =
        null

      amplitudes.current =
        null

      creado.current = false

    }

  }, [objeto])


  // ===================================================
  // ANIMACION SJ
  // CASI ESTATICA PARA CONSERVAR LEGIBILIDAD
  // ===================================================

  useFrame((state) => {

    if (
      !puntos.current ||
      !material.current ||
      !posicionesBase.current ||
      !velocidades.current ||
      !fases.current ||
      !amplitudes.current
    ) {
      return
    }


    const tiempo =
      state.clock.elapsedTime


    const posiciones =
      puntos.current
        .geometry
        .attributes
        .position


    const base =
      posicionesBase.current

    const velocidadesParticula =
      velocidades.current

    const fasesParticula =
      fases.current

    const amplitudesParticula =
      amplitudes.current


    // =================================================
    // MOVIMIENTO DE PARTICULAS
    // REDUCIDO AL MINIMO
    // =================================================

    for (
      let i = 0;
      i <
      velocidadesParticula.length;
      i++
    ) {

      const indice =
        i * 3

      const fase =
        fasesParticula[i]

      const velocidad =
        velocidadesParticula[i]

      const amplitud =
        amplitudesParticula[i]


      const movimientoX =
        Math.sin(
          tiempo *
          velocidad *
          0.28 +
          fase
        ) *
        amplitud


      const movimientoY =
        Math.sin(
          tiempo *
          velocidad *
          0.22 +
          fase *
          1.4
        ) *
        amplitud *
        0.45


      const movimientoZ =
        Math.cos(
          tiempo *
          velocidad *
          0.24 +
          fase
        ) *
        amplitud


      posiciones.array[indice] =
        base[indice] +
        movimientoX

      posiciones.array[
        indice + 1
      ] =
        base[indice + 1] +
        movimientoY

      posiciones.array[
        indice + 2
      ] =
        base[indice + 2] +
        movimientoZ

    }


    posiciones.needsUpdate =
      true


    // =================================================
    // FLOTACION MINIMA
    // =================================================

    puntos.current.position.y =
      posicionInicial.current.y +
      Math.sin(
        tiempo * 0.55
      ) *
      0.008


    // =================================================
    // MOVIMIENTO LATERAL MINIMO
    // =================================================

    puntos.current.position.x =
      posicionInicial.current.x +
      Math.sin(
        tiempo * 0.45
      ) *
      0.003


    // =================================================
    // ROTACION MINIMA
    // =================================================

    puntos.current.rotation.y =
      objeto.rotation.y +
      Math.sin(
        tiempo * 0.35
      ) *
      0.003


    puntos.current.rotation.x =
      objeto.rotation.x +
      Math.sin(
        tiempo * 0.25
      ) *
      0.0015


    // =================================================
    // FLICKER MINIMO
    // =================================================

    material.current.opacity =
      0.54 +
      Math.sin(
        tiempo * 2.5
      ) *
      0.012

    material.current.size =
      0.0085 +
      Math.sin(
        tiempo * 2.2
      ) *
      0.0002

  })


  return null
}


// =====================================================
// PARTICULAS DEL PROYECTOR
// =====================================================

function ParticulasProyector({
  objeto,
  analizadorAudioRef,
}) {

  const puntos =
    useRef(null)

  const material =
    useRef(null)

  const creado =
    useRef(false)

  // ===================================================
  // REACTIVIDAD A LA MUSICA
  // datosFrecuencia se reutiliza siempre (no se crea
  // en cada frame). nivelAudio ya viene suavizado.
  // ===================================================

  const datosFrecuencia =
    useRef(null)

  const nivelAudio =
    useRef(0)

  // Escala original del objeto: sin esto, el pulso de
  // audio pisaria (reemplazaria) la escala real en vez
  // de solo modularla.

  const escalaBase =
    useRef(
      new THREE.Vector3(1, 1, 1)
    )


  useEffect(() => {

    if (
      !objeto ||
      !objeto.geometry ||
      creado.current
    ) {
      return
    }

    creado.current = true


    const posicion =
      objeto.geometry
        .attributes
        .position


    if (!posicion) {

      creado.current = false

      return
    }


    const cantidad =
      Math.min(
        3000,
        posicion.count
      )


    const posiciones =
      new Float32Array(
        cantidad * 3
      )


    for (
      let i = 0;
      i < cantidad;
      i++
    ) {

      const indice =
        Math.floor(
          Math.random() *
          posicion.count
        )


      posiciones[i * 3] =
        posicion.getX(indice) +
        (Math.random() - 0.5) *
        0.10


      posiciones[i * 3 + 1] =
        posicion.getY(indice) +
        (Math.random() - 0.5) *
        0.10


      posiciones[i * 3 + 2] =
        posicion.getZ(indice) +
        (Math.random() - 0.5) *
        0.10

    }


    const geometry =
      new THREE.BufferGeometry()


    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        posiciones,
        3
      )
    )


    const mat =
      new THREE.PointsMaterial({

        color: '#36DFFF',

        size: 0.019,

        transparent: true,

        opacity: 0.88,

        blending:
          THREE.AdditiveBlending,

        depthWrite: false,

        sizeAttenuation: true,

      })


    material.current =
      mat


    puntos.current =
      new THREE.Points(
        geometry,
        mat
      )


    puntos.current.position.copy(
      objeto.position
    )

    puntos.current.rotation.copy(
      objeto.rotation
    )

    puntos.current.scale.copy(
      objeto.scale
    )

    escalaBase.current.copy(
      objeto.scale
    )

    puntos.current.renderOrder =
      15


    if (objeto.parent) {

      objeto.parent.add(
        puntos.current
      )

    }


    return () => {

      if (
        puntos.current &&
        objeto.parent
      ) {

        objeto.parent.remove(
          puntos.current
        )

      }


      geometry.dispose()

      mat.dispose()

      puntos.current = null

      material.current = null

      creado.current = false

    }

  }, [objeto])


  useFrame((state) => {

    if (
      !puntos.current ||
      !material.current
    ) {
      return
    }


    const tiempo =
      state.clock.elapsedTime


    // =================================================
    // LECTURA DE AUDIO (SI EXISTE)
    // Si todavia no hay analizador (usuario no ha
    // interactuado aun, o el navegador no soporta Web
    // Audio API), nivelCrudo queda en 0 y el resto del
    // efecto se comporta exactamente igual que antes.
    // =================================================

    let nivelCrudo = 0


    if (
      analizadorAudioRef &&
      analizadorAudioRef.current
    ) {

      const analizador =
        analizadorAudioRef.current


      if (!datosFrecuencia.current) {

        datosFrecuencia.current =
          new Uint8Array(
            analizador.frequencyBinCount
          )

      }


      analizador.getByteFrequencyData(
        datosFrecuencia.current
      )


      // Solo graves/medios-graves: se siente
      // mas "al ritmo" que promediar todo el
      // espectro.

      const bandas =
        Math.max(
          1,
          Math.floor(
            datosFrecuencia.current.length *
            0.5
          )
        )


      let suma = 0

      for (
        let i = 0;
        i < bandas;
        i++
      ) {

        suma +=
          datosFrecuencia.current[i]

      }


      nivelCrudo =
        suma /
        bandas /
        255

    }


    // Suavizado: evita que las particulas
    // "tiemblen" con cada pico brusco de la mezcla.

    nivelAudio.current =
      THREE.MathUtils.lerp(
        nivelAudio.current,
        nivelCrudo,
        0.08
      )


    const impulso =
      1 +
      nivelAudio.current *
      0.9


    puntos.current.position.y =
      objeto.position.y +
      Math.sin(
        tiempo *
        (1.8 + nivelAudio.current * 1.4)
      ) *
      0.025 *
      impulso


    puntos.current.position.x =
      objeto.position.x +
      Math.sin(
        tiempo *
        (1.2 + nivelAudio.current * 1.0)
      ) *
      0.015 *
      impulso


    puntos.current.scale
      .copy(
        escalaBase.current
      )
      .multiplyScalar(
        1 +
        nivelAudio.current *
        0.08
      )


    material.current.opacity =
      Math.min(
        1,
        0.65 +
        Math.sin(
          tiempo * 4
        ) *
        0.18 +
        nivelAudio.current *
        0.15
      )

  })


  return null
}


// =====================================================
// HAZ HOLOGRAFICO
// =====================================================

function HazHolografico({
  objeto,
}) {

  const grupo =
    useRef(null)

  const material =
    useRef(null)


  useFrame((state) => {

    if (
      !grupo.current ||
      !material.current ||
      !objeto
    ) {
      return
    }


    const tiempo =
      state.clock.elapsedTime


    material.current.opacity =
      0.045 +
      Math.sin(
        tiempo * 2.5
      ) *
      0.012


    grupo.current.scale.x =
      1 +
      Math.sin(
        tiempo * 1.5
      ) *
      0.025

  })


  if (!objeto) {
    return null
  }


  const posicion =
    objeto.position


  return (

    <group
      ref={grupo}
      position={[
        posicion.x,
        posicion.y + 2.8,
        posicion.z,
      ]}
    >

      <mesh>

        <cylinderGeometry
          args={[
            0.8,
            0.8,
            5.6,
            48,
            1,
            true,
          ]}
        />

        <meshBasicMaterial
          ref={material}
          color="#20DFFF"
          transparent
          opacity={0.05}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          side={
            THREE.DoubleSide
          }
        />

      </mesh>


      <pointLight
        color="#20DFFF"
        intensity={1.6}
        distance={8}
        decay={2}
      />

    </group>
  )
}


// =====================================================
// MODELO
// =====================================================

function Modelo({
  camaraActual,
  setCamara,
  abrirSobreMi,
  analizadorAudioRef,
  cursorModoRef,
}) {

  const {
    scene,
    cameras,
  } =
    useGLTF(
      '/PORTAFOLIO_WEB.glb'
    )


  const { camera } =
    useThree()


  const [suelo, setSuelo] =
    useState(null)


  const [
    cabeza,
    setCabeza,
  ] =
    useState(null)


  const [
    cilindro,
    setCilindro,
  ] =
    useState(null)


  const [
    sj,
    setSj,
  ] =
    useState(null)


  const posicionObjetivo =
    useRef(
      new THREE.Vector3()
    )


  const quaternionObjetivo =
    useRef(
      new THREE.Quaternion()
    )


  const fovObjetivo =
    useRef(50)


  const centroEscenario =
    useRef(
      new THREE.Vector3()
    )


  const radio =
    useRef(10)


  const anguloHorizontal =
    useRef(0)


  const anguloVertical =
    useRef(0.25)


  const posicionInicial =
    useRef(
      new THREE.Vector3()
    )


  const rotacionInicial =
    useRef(
      new THREE.Euler()
    )


  const mousePresionado =
    useRef(false)


  const mouseAnterior =
    useRef({
      x: 0,
      y: 0,
    })


  const sensibilidadHorizontal =
    0.003


  const sensibilidadVertical =
    0.0025


  const zoomMinimo =
    2.5


  const zoomMaximo =
    30


  const limiteY =
    2.60092


  // ===================================================
  // CAM_SOBRE_MI YA NO SE UTILIZA.
  //
  // sj001 -> contacto
  // sj002 -> tarjeta SOBRE MI
  // sj003 -> proyectos
  // ===================================================

  const botones = {

    sj001:
      'CAM_CONTACTO',

    sj002:
      null,

    sj003:
      'CAM_PROYECTOS',

  }


  const materialesOriginales =
    useRef({})

  const objetosRedes =
    useRef({})

  const escalasRedesOriginales =
    useRef({})


  // ===================================================
  // BUSCAR OBJETOS
  // ===================================================

  useEffect(() => {

    // -------------------------------------------------
    // CABEZA
    // -------------------------------------------------

    const cabezaEncontrada =
      scene.getObjectByName(
        'CABEZA_HOLOGRAMA'
      )


    // -------------------------------------------------
    // PROYECTOR CORRECTO
    // -------------------------------------------------

    const cilindroEncontrado =
      scene.getObjectByName(
        ''
      )


    // -------------------------------------------------
    // SUELO
    // -------------------------------------------------

    const sueloEncontrado =
      scene.getObjectByName(
        'Plane'
      )


    // -------------------------------------------------
    // SJ
    //
    // SOLO EXACTAMENTE "sj"
    // -------------------------------------------------

    const sjEncontrado =
      scene.getObjectByName(
        'sj'
      )


    if (sueloEncontrado) {

      setSuelo(
        sueloEncontrado
      )

    }


    // -------------------------------------------------
    // CABEZA
    // -------------------------------------------------

    if (cabezaEncontrada) {

      setCabeza(
        cabezaEncontrada
      )


      const materialHolograma =
        new THREE.MeshStandardMaterial({

          color: '#1597FF',

          emissive: '#1597FF',

          emissiveIntensity: 2.2,

          transparent: true,

          opacity: 0,

          metalness: 0.1,

          roughness: 0.3,

          depthWrite: false,

          side: THREE.DoubleSide,

        })


      cabezaEncontrada.material =
        materialHolograma


      cabezaEncontrada.visible =
        false


      cabezaEncontrada.renderOrder =
        5

    }


    // -------------------------------------------------
    // PROYECTOR
    // -------------------------------------------------

    if (cilindroEncontrado) {

      setCilindro(
        cilindroEncontrado
      )


      if (
        cilindroEncontrado.material
      ) {

        cilindroEncontrado.material =
          cilindroEncontrado
            .material
            .clone()


        cilindroEncontrado.material
          .transparent =
          true


        cilindroEncontrado.material
          .opacity =
          0.10

      }

    }


    // -------------------------------------------------
    // SJ
    // -------------------------------------------------

    if (sjEncontrado) {

      setSj(
        sjEncontrado
      )


      // Ocultar el objeto sólido.
      // HologramaSJ crea las partículas.

      sjEncontrado.visible =
        false

    }


    // -------------------------------------------------
    // BOTONES
    // -------------------------------------------------

    Object.keys(
      botones
    ).forEach(
      (nombre) => {

        const objeto =
          scene.getObjectByName(
            nombre
          )


        if (
          objeto &&
          objeto.material
        ) {

          materialesOriginales
            .current[nombre] =
            {

              color:
                objeto.material
                  .color
                  ? objeto.material
                      .color
                      .clone()
                  : new THREE.Color(
                      '#FFFFFF'
                    ),

              emissive:
                objeto.material
                  .emissive
                  ? objeto.material
                      .emissive
                      .clone()
                  : new THREE.Color(
                      '#000000'
                    ),

              emissiveIntensity:
                objeto.material
                  .emissiveIntensity ||
                0,

            }


          // SOBRE MI comienza completamente
          // apagado. Solo se ilumina con hover.

          if (nombre === 's002') {

            

          }

        }

      }
    )


    // -------------------------------------------------
    // REDES SOCIALES
    // -------------------------------------------------

    REDES_SOCIALES.forEach(
      (nombre) => {

        const objetoRed =
          scene.getObjectByName(
            nombre
          )


        if (objetoRed) {

          objetosRedes.current[nombre] =
            objetoRed

          escalasRedesOriginales
            .current[nombre] =
            objetoRed.scale.clone()

          objetoRed.userData.redHover =
            false

        }

      }
    )

  }, [scene])


  // ===================================================
  // CAMARA HOME
  // ===================================================

  useEffect(() => {

    const camaraHome =
      cameras.find(
        (cam) =>
          cam.name ===
          'CAM_HOME'
      )


    if (!camaraHome) {
      return
    }


    posicionInicial.current.copy(
      camaraHome.position
    )


    rotacionInicial.current.copy(
      camaraHome.rotation
    )


    centroEscenario.current.set(
      0,
      0,
      0
    )


    const vector =
      new THREE.Vector3()


    vector.copy(
      camaraHome.position
    )


    vector.sub(
      centroEscenario.current
    )


    radio.current =
      vector.length()


    anguloHorizontal.current =
      Math.atan2(
        vector.x,
        vector.z
      )


    anguloVertical.current =
      Math.asin(
        THREE.MathUtils.clamp(
          vector.y /
          radio.current,
          -1,
          1
        )
      )


    if (
      camaraActual ===
      'CAM_HOME'
    ) {

      camera.position.copy(
        camaraHome.position
      )


      camera.quaternion.copy(
        camaraHome.quaternion
      )


      camera.fov =
        camaraHome.fov


      camera.updateProjectionMatrix()

    }

  }, [
    cameras,
    camera,
  ])


  // ===================================================
  // CAMARAS DE SECCION
  // ===================================================

  useEffect(() => {

    const camaraObjetivo =
      cameras.find(
        (cam) =>
          cam.name ===
          camaraActual
      )


    if (!camaraObjetivo) {
      return
    }


    posicionObjetivo.current.copy(
      camaraObjetivo.position
    )


    quaternionObjetivo.current.copy(
      camaraObjetivo.quaternion
    )


    fovObjetivo.current =
      camaraObjetivo.fov

  }, [
    camaraActual,
    cameras,
  ])


  // ===================================================
  // CONTROLES
  // ===================================================

  useEffect(() => {

    if (
      camaraActual !==
      'CAM_HOME'
    ) {
      return
    }


    const presionarMouse = (
      e
    ) => {

      if (e.button !== 0) {
        return
      }


      mousePresionado.current =
        true


      mouseAnterior.current.x =
        e.clientX


      mouseAnterior.current.y =
        e.clientY


      document.body.style.cursor =
        'grabbing'

      if (cursorModoRef) {
        cursorModoRef.current =
          'grabbing'
      }

    }


    const soltarMouse = () => {

      mousePresionado.current =
        false


      document.body.style.cursor =
        'default'

      if (cursorModoRef) {
        cursorModoRef.current =
          'default'
      }

    }


    const moverMouse = (
      e
    ) => {

      if (
        !mousePresionado.current
      ) {
        return
      }


      const deltaX =
        e.clientX -
        mouseAnterior.current.x


      const deltaY =
        e.clientY -
        mouseAnterior.current.y


      mouseAnterior.current.x =
        e.clientX


      mouseAnterior.current.y =
        e.clientY


      anguloHorizontal.current -=
        deltaX *
        sensibilidadHorizontal


      anguloVertical.current -=
        deltaY *
        sensibilidadVertical


      anguloVertical.current =
        THREE.MathUtils.clamp(
          anguloVertical.current,
          -0.15,
          1.15
        )

    }


    const scroll = (
      e
    ) => {

      e.preventDefault()


      radio.current +=
        e.deltaY *
        0.012


      radio.current =
        THREE.MathUtils.clamp(
          radio.current,
          zoomMinimo,
          zoomMaximo
        )

    }


    window.addEventListener(
      'mousedown',
      presionarMouse
    )


    window.addEventListener(
      'mouseup',
      soltarMouse
    )


    window.addEventListener(
      'mouseleave',
      soltarMouse
    )


    window.addEventListener(
      'mousemove',
      moverMouse
    )


    window.addEventListener(
      'wheel',
      scroll,
      {
        passive: false,
      }
    )


    return () => {

      window.removeEventListener(
        'mousedown',
        presionarMouse
      )


      window.removeEventListener(
        'mouseup',
        soltarMouse
      )


      window.removeEventListener(
        'mouseleave',
        soltarMouse
      )


      window.removeEventListener(
        'mousemove',
        moverMouse
      )


      window.removeEventListener(
        'wheel',
        scroll
      )


      document.body.style.cursor =
        'default'

    }

  }, [camaraActual])


  // ===================================================
  // ANIMACION CAMARA
  // ===================================================

  useFrame(() => {

    // =================================================
    // ANIMACION DE LOS TRES LOGOS SOCIALES
    // =================================================

    Object.entries(
      objetosRedes.current
    ).forEach(
      ([nombre, objetoRed]) => {

        if (!objetoRed) return


        const escalaOriginal =
          escalasRedesOriginales
            .current[nombre]


        if (!escalaOriginal) return


        const escalaObjetivo =
          objetoRed.userData.redHover
            ? escalaOriginal
                .clone()
                .multiplyScalar(1.10)
            : escalaOriginal


        objetoRed.scale.lerp(
          escalaObjetivo,
          0.18
        )

      }
    )


    if (
      camaraActual ===
      'CAM_HOME'
    ) {

      const radioActual =
        radio.current


      const horizontal =
        Math.cos(
          anguloVertical.current
        ) *
        radioActual


      const destinoX =
        centroEscenario.current.x +
        Math.sin(
          anguloHorizontal.current
        ) *
        horizontal


      let destinoY =
        centroEscenario.current.y +
        Math.sin(
          anguloVertical.current
        ) *
        radioActual


      const destinoZ =
        centroEscenario.current.z +
        Math.cos(
          anguloHorizontal.current
        ) *
        horizontal


      if (
        destinoY <
        limiteY
      ) {

        destinoY =
          limiteY

      }


      const destino =
        new THREE.Vector3(
          destinoX,
          destinoY,
          destinoZ
        )


      camera.position.lerp(
        destino,
        0.08
      )


      const objetivo =
        new THREE.Vector3(
          centroEscenario.current.x,
          centroEscenario.current.y,
          centroEscenario.current.z
        )


      const quaternion =
        new THREE.Quaternion()


      quaternion.setFromRotationMatrix(
        new THREE.Matrix4().lookAt(
          camera.position,
          objetivo,
          new THREE.Vector3(
            0,
            1,
            0
          )
        )
      )


      camera.quaternion.slerp(
        quaternion,
        0.08
      )


      camera.fov =
        THREE.MathUtils.lerp(
          camera.fov,
          50,
          0.05
        )


      camera.updateProjectionMatrix()

    } else {

      camera.position.lerp(
        posicionObjetivo.current,
        0.05
      )


      camera.quaternion.slerp(
        quaternionObjetivo.current,
        0.05
      )


      camera.fov =
        THREE.MathUtils.lerp(
          camera.fov,
          fovObjetivo.current,
          0.05
        )


      camera.updateProjectionMatrix()

    }

  })


  // ===================================================
  // BUSCAR OBJETO INTERACTIVO REAL
  // Permite que los logos funcionen aunque el click
  // ocurra sobre un mesh hijo.
  // ===================================================

  const obtenerObjetoInteractivo = (
    objeto
  ) => {

    let actual =
      objeto


    while (actual) {

      if (
        REDES_SOCIALES.includes(
          actual.name
        ) ||
        actual.name === 'sj001' ||
        actual.name === 'sj002' ||
        actual.name === 'sj003'
      ) {

        return actual

      }

      actual =
        actual.parent

    }


    return objeto

  }


  // ===================================================
  // HOVER
  // ===================================================

  const manejarHover = (
    e
  ) => {

    e.stopPropagation()


    const objeto =
      obtenerObjetoInteractivo(
        e.object
      )


    const nombre =
      objeto.name


    // -------------------------------------------------
    // REDES SOCIALES
    // -------------------------------------------------

    if (
      REDES_SOCIALES.includes(
        nombre
      )
    ) {

      objeto.userData.redHover =
        true

      document.body.style.cursor =
        'pointer'

      if (cursorModoRef) {
        cursorModoRef.current =
          'hover'
      }

      return

    }


    // -------------------------------------------------
    // BOTONES
    // -------------------------------------------------

    if (
      nombre !== 'sj001' &&
      nombre !== 'sj002' &&
      nombre !== 'sj003'
    ) {

      return

    }


    if (!objeto.material) {
      return
    }


    document.body.style.cursor =
      'pointer'

    if (cursorModoRef) {
      cursorModoRef.current =
        'hover'
    }


    // Solo durante hover cambia el color.

    objeto.material.color.set(
      '#63D8FF'
    )


    if (
      objeto.material.emissive
    ) {

      objeto.material.emissive.set(
        '#1597FF'
      )


      objeto.material
        .emissiveIntensity =
        0.65

    }

  }


  // ===================================================
  // QUITAR HOVER
  // ===================================================

  const quitarHover = (
    e
  ) => {

    e.stopPropagation()


    const objeto =
      obtenerObjetoInteractivo(
        e.object
      )


    const nombre =
      objeto.name


    // -------------------------------------------------
    // REDES SOCIALES
    // -------------------------------------------------

    if (
      REDES_SOCIALES.includes(
        nombre
      )
    ) {

      objeto.userData.redHover =
        false

      document.body.style.cursor =
        'default'

      if (cursorModoRef) {
        cursorModoRef.current =
          'default'
      }

      return

    }


    // -------------------------------------------------
    // BOTONES
    // -------------------------------------------------

    if (
      nombre !== 'sj001' &&
      nombre !== 'sj002' &&
      nombre !== 'sj003'
    ) {

      return

    }


    document.body.style.cursor =
      'default'

    if (cursorModoRef) {
      cursorModoRef.current =
        'default'
    }


    const original =
      materialesOriginales
        .current[nombre]


    if (!original) {
      return
    }


    // RESTAURAR COLOR ORIGINAL.
    // YA NO QUEDA AZUL DESPUES DEL HOVER.

    objeto.material.color.copy(
      original.color
    )


    if (
      objeto.material.emissive &&
      original.emissive
    ) {

      objeto.material.emissive.copy(
        original.emissive
      )


      // SOBRE MI SIEMPRE QUEDA
      // CON EMISION CERO FUERA DEL HOVER.

      

    }

  }


  // ===================================================
  // CLICK
  // ===================================================

  const manejarClick = (
    e
  ) => {

    e.stopPropagation()


    const objeto =
      obtenerObjetoInteractivo(
        e.object
      )


    const nombre =
      objeto.name


    // =================================================
    // REDES SOCIALES
    // =================================================

    if (
      REDES_SOCIALES.includes(
        nombre
      )
    ) {

      window.open(
        REDES_URL,
        '_blank',
        'noopener,noreferrer'
      )

      return

    }


    // =================================================
    // SOBRE MI
    // NO CAMBIA DE CAMARA.
    // ABRE TARJETA.
    // =================================================

    if (
      nombre === 'sj002'
    ) {

      abrirSobreMi()

      return

    }


    // =================================================
    // RESTO DE BOTONES
    // =================================================

    const camara =
      botones[nombre]


    if (!camara) {
      return
    }


    setCamara(
      camara
    )

  }


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <>

      <primitive
        object={scene}
        onClick={
          manejarClick
        }
        onPointerOver={
          manejarHover
        }
        onPointerOut={
          quitarHover
        }
      />


      {suelo && (
        <ConfigurarSuelo
          suelo={suelo}
        />
      )}


      {cabeza && (
        <PuntosHolograma
          cabeza={cabeza}
        />
      )}


      {cilindro && (
        <>

          <ParticulasProyector
            objeto={cilindro}
            analizadorAudioRef={
              analizadorAudioRef
            }
          />

          <HazHolografico
            objeto={cilindro}
          />

        </>
      )}


      {sj && (
        <HologramaSJ
          objeto={sj}
        />
      )}

    </>

  )
}


// =====================================================
// TARJETA SOBRE MI
// =====================================================

function SobreMiCard({
  visible,
  cerrar,
  cursorModoRef,
}) {

  useEffect(() => {

    if (!visible) {
      return
    }

    const estilo =
      document.createElement(
        'style'
      )

    estilo.innerHTML = `

      @keyframes sobreMiEntrada {

        0% {
          opacity: 0;
          transform:
            translate(-50%, -46%)
            scale(0.92);
          filter:
            blur(10px);
        }

        100% {
          opacity: 1;
          transform:
            translate(-50%, -50%)
            scale(1);
          filter:
            blur(0);
        }

      }

      @keyframes sobreMiSalida {

        0% {
          opacity: 1;
          transform:
            translate(-50%, -50%)
            scale(1);
          filter:
            blur(0);
        }

        100% {
          opacity: 0;
          transform:
            translate(-50%, -46%)
            scale(0.94);
          filter:
            blur(8px);
        }

      }

      @keyframes hologramaLineas {

        0% {
          opacity: 0.18;
          transform: translateX(-20%);
        }

        50% {
          opacity: 0.42;
        }

        100% {
          opacity: 0.18;
          transform: translateX(20%);
        }

      }

      @keyframes hologramaGlow {

        0% {
          box-shadow:
            0 0 18px rgba(30,220,255,0.16),
            inset 0 0 20px rgba(30,220,255,0.04);
        }

        50% {
          box-shadow:
            0 0 35px rgba(30,220,255,0.28),
            inset 0 0 30px rgba(30,220,255,0.07);
        }

        100% {
          box-shadow:
            0 0 18px rgba(30,220,255,0.16),
            inset 0 0 20px rgba(30,220,255,0.04);
        }

      }

      .sobre-mi-card {

        animation:
          sobreMiEntrada
          0.45s
          cubic-bezier(.2,.8,.2,1)
          forwards,

          hologramaGlow
          3s
          ease-in-out
          infinite;

      }

      .sobre-mi-scan {

        animation:
          hologramaLineas
          2.5s
          ease-in-out
          infinite;

      }

      .sobre-mi-close:hover {

        transform: scale(1.08);

        background:
          rgba(30,220,255,0.18) !important;

        border-color:
          rgba(100,235,255,0.95) !important;

        box-shadow:
          0 0 18px
          rgba(30,220,255,0.45);

      }

      .sobre-mi-skill {

        transition:
          all 0.25s ease;

      }

      .sobre-mi-skill:hover {

        transform:
          translateY(-2px);

        border-color:
          rgba(100,235,255,0.65) !important;

        background:
          rgba(30,220,255,0.10) !important;

        box-shadow:
          0 0 12px
          rgba(30,220,255,0.16);

      }

    `

    document.head.appendChild(
      estilo
    )

    return () => {

      document.head.removeChild(
        estilo
      )

    }

  }, [visible])


  if (!visible) {
    return null
  }


  return (

    <div
      style={{

        position: 'fixed',

        inset: 0,

        zIndex: 200,

        pointerEvents: 'auto',

        background:
          'rgba(0,5,12,0.16)',

        backdropFilter:
          'blur(2px)',

      }}
      onClick={cerrar}
    >

      <div
        className="sobre-mi-card"
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{

          position: 'absolute',

          top: '50%',

          left: '50%',

          transform:
            'translate(-50%, -50%)',

          width:
            'min(560px, calc(100vw - 40px))',

          maxHeight:
            'min(700px, calc(100vh - 50px))',

          overflowY: 'auto',

          boxSizing: 'border-box',

          padding: '34px',

          border:
            '1px solid rgba(75,225,255,0.62)',

          borderRadius: '10px',

          background:
            'linear-gradient(145deg, rgba(5,17,30,0.94), rgba(3,8,18,0.88))',

          backdropFilter:
            'blur(20px)',

          WebkitBackdropFilter:
            'blur(20px)',

          color: '#DDF8FF',

          fontFamily:
            'Arial, Helvetica, sans-serif',

          overflow: 'hidden',

        }}
      >

        <div
          className="sobre-mi-scan"
          style={{

            position: 'absolute',

            left: '-20%',

            top: '30%',

            width: '140%',

            height: '1px',

            background:
              'rgba(75,225,255,0.45)',

            boxShadow:
              '0 0 12px rgba(50,220,255,0.65)',

            pointerEvents: 'none',

          }}
        />


        <div
          style={{

            position: 'absolute',

            top: 0,

            left: 0,

            right: 0,

            height: '2px',

            background:
              'linear-gradient(90deg, transparent, #42E6FF, transparent)',

            boxShadow:
              '0 0 14px rgba(50,220,255,0.7)',

          }}
        />


        <div
          style={{

            position: 'absolute',

            bottom: 0,

            left: 0,

            right: 0,

            height: '1px',

            background:
              'linear-gradient(90deg, transparent, rgba(50,220,255,0.55), transparent)',

          }}
        />


        <button
          className="sobre-mi-close"
          onClick={cerrar}
          aria-label="Cerrar"
          style={{

            position: 'absolute',

            top: '16px',

            right: '16px',

            width: '34px',

            height: '34px',

            border:
              '1px solid rgba(90,220,255,0.48)',

            borderRadius: '5px',

            background:
              'rgba(10,25,40,0.58)',

            color: '#BDEFFF',

            fontSize: '19px',

            lineHeight: '30px',

            cursor: 'pointer',

            transition:
              'all 0.25s ease',

          }}
          onMouseEnter={() => {
            if (cursorModoRef) {
              cursorModoRef.current =
                'hover'
            }
          }}
          onMouseLeave={() => {
            if (cursorModoRef) {
              cursorModoRef.current =
                'default'
            }
          }}
        >
          ×
        </button>


        <div
          style={{

            display: 'flex',

            alignItems: 'center',

            gap: '13px',

            marginBottom: '8px',

          }}
        >

          <div
            style={{

              width: '7px',

              height: '34px',

              background: '#42E6FF',

              boxShadow:
                '0 0 16px rgba(50,225,255,0.9)',

            }}
          />

          <div>

            <div
              style={{

                fontSize: '11px',

                letterSpacing: '4px',

                color:
                  'rgba(130,225,255,0.68)',

                marginBottom: '5px',

              }}
            >
              PROFILE // 001
            </div>

            <h2
              style={{

                margin: 0,

                fontSize: '27px',

                fontWeight: '500',

                letterSpacing: '5px',

                color: '#E7FBFF',

                textShadow:
                  '0 0 14px rgba(50,220,255,0.55)',

              }}
            >
              SOBRE MÍ
            </h2>

          </div>

        </div>


        <div
          style={{

            width: '100%',

            height: '1px',

            margin:
              '20px 0 24px',

            background:
              'linear-gradient(90deg, rgba(55,220,255,0.65), rgba(55,220,255,0.05), transparent)',

          }}
        />


        <div
          style={{
            marginBottom: '22px',
          }}
        >

          <div
            style={{

              fontSize: '10px',

              letterSpacing: '3px',

              color:
                'rgba(130,225,255,0.55)',

              marginBottom: '6px',

            }}
          >
            NOMBRE
          </div>

          <div
            style={{

              fontSize: '21px',

              letterSpacing: '2px',

              color: '#F0FCFF',

            }}
          >
            David
          </div>

        </div>


        <div
          style={{
            marginBottom: '22px',
          }}
        >

          <div
            style={{

              fontSize: '10px',

              letterSpacing: '3px',

              color:
                'rgba(130,225,255,0.55)',

              marginBottom: '7px',

            }}
          >
            PERFIL
          </div>

          <div
            style={{

              fontSize: '15px',

              lineHeight: '1.7',

              color:
                'rgba(225,247,255,0.86)',

            }}
          >
            Diseñador / creador audiovisual / desarrollador 3D
          </div>

        </div>


        <div
          style={{
            marginBottom: '25px',
          }}
        >

          <div
            style={{

              fontSize: '10px',

              letterSpacing: '3px',

              color:
                'rgba(130,225,255,0.55)',

              marginBottom: '7px',

            }}
          >
            DESCRIPCIÓN
          </div>

          <div
            style={{

              fontSize: '14px',

              lineHeight: '1.8',

              color:
                'rgba(220,244,252,0.76)',

            }}
          >
            Aquí irá mi descripción personal. Este texto es un ejemplo
            editable que puedes reemplazar posteriormente por tu
            presentación profesional, experiencia y objetivos.
          </div>

        </div>


        <div>

          <div
            style={{

              fontSize: '10px',

              letterSpacing: '3px',

              color:
                'rgba(130,225,255,0.55)',

              marginBottom: '11px',

            }}
          >
            HABILIDADES
          </div>


          <div
            style={{

              display: 'flex',

              flexWrap: 'wrap',

              gap: '8px',

            }}
          >

            {[
              'Audiovisual',
              'Diseño',
              'Blender',
              'React',
              'Three.js',
              'Edición',
              'Motion Graphics',
            ].map(
              (habilidad) => (

                <div
                  key={habilidad}
                  className="sobre-mi-skill"
                  style={{

                    padding:
                      '8px 11px',

                    border:
                      '1px solid rgba(75,200,235,0.28)',

                    borderRadius: '4px',

                    background:
                      'rgba(20,100,135,0.08)',

                    color:
                      'rgba(210,246,255,0.84)',

                    fontSize: '11px',

                    letterSpacing: '1px',

                  }}
                >
                  {habilidad}
                </div>

              )
            )}

          </div>

        </div>


        <div
          style={{

            marginTop: '28px',

            paddingTop: '14px',

            borderTop:
              '1px solid rgba(70,190,220,0.14)',

            display: 'flex',

            justifyContent: 'space-between',

            fontSize: '9px',

            letterSpacing: '2px',

            color:
              'rgba(120,215,240,0.40)',

          }}
        >

          <span>
            SYSTEM ONLINE
          </span>

          <span>
            HOLOGRAPHIC UI
          </span>

        </div>

      </div>

    </div>
  )
}


// =====================================================
// BOTON HOME
// =====================================================

function HomeButton({
  setCamara,
  cursorModoRef,
}) {

  return (

    <button

      onClick={() =>
        setCamara(
          'CAM_HOME'
        )
      }

      style={{

        position: 'fixed',

        top: '28px',

        left: '30px',

        zIndex: 100,

        padding: '8px 14px',

        background:
          'rgba(5,10,20,0.35)',

        color: '#D9F5FF',

        border:
          '1px solid rgba(100,210,255,0.45)',

        borderRadius: '4px',

        fontFamily:
          'Arial, sans-serif',

        fontSize: '12px',

        fontWeight: '500',

        letterSpacing: '3px',

        cursor: 'pointer',

        backdropFilter:
          'blur(10px)',

        transition:
          'all 0.3s ease',

      }}


      onMouseEnter={(e) => {

        if (cursorModoRef) {
          cursorModoRef.current =
            'hover'
        }


        e.currentTarget.style.color =
          '#FFFFFF'


        e.currentTarget.style.border =
          '1px solid rgba(100,220,255,0.9)'


        e.currentTarget.style.background =
          'rgba(20,120,180,0.2)'


        e.currentTarget.style.boxShadow =
          '0 0 18px rgba(50,190,255,0.55)'

      }}


      onMouseLeave={(e) => {

        if (cursorModoRef) {
          cursorModoRef.current =
            'default'
        }


        e.currentTarget.style.color =
          '#D9F5FF'


        e.currentTarget.style.border =
          '1px solid rgba(100,210,255,0.45)'


        e.currentTarget.style.background =
          'rgba(5,10,20,0.35)'


        e.currentTarget.style.boxShadow =
          'none'

      }}

    >

      ⌂ HOME

    </button>
  )
}


// =====================================================
// MÚSICA AMBIENTAL
// =====================================================

function MusicaAmbiental({
  analizadorAudioRef,
  cursorModoRef,
}) {

  const audio =
    useRef(null)

  const [
    reproduciendo,
    setReproduciendo,
  ] =
    useState(false)

  // Evita crear el AudioContext/analizador
  // mas de una vez.

  const fuenteCreada =
    useRef(false)


  useEffect(() => {

    const elemento =
      audio.current

    if (!elemento) return


    elemento.volume =
      0.14

    elemento.loop =
      true


    const iniciar = () => {

      elemento
        .play()
        .then(() =>
          setReproduciendo(true)
        )
        .catch(() => {})


      // =================================================
      // WEB AUDIO API — SOLO UNA VEZ
      // Se crea dentro del mismo gesto del usuario que ya
      // dispara el play(), asi que nunca queda suspendido
      // por la politica de autoplay. Si el navegador no
      // soporta esto, simplemente no hay reactividad y la
      // musica sigue igual.
      // =================================================

      if (
        !fuenteCreada.current &&
        !elemento.dataset.audioSourceCreado
      ) {

        try {

          const ContextoAudio =
            window.AudioContext ||
            window.webkitAudioContext


          const contexto =
            new ContextoAudio()


          if (
            contexto.state ===
            'suspended'
          ) {

            contexto
              .resume()
              .catch(() => {})

          }


          const analizador =
            contexto.createAnalyser()

          analizador.fftSize = 64

          analizador
            .smoothingTimeConstant =
            0.75


          const fuente =
            contexto.createMediaElementSource(
              elemento
            )


          fuente.connect(
            analizador
          )

          // OBLIGATORIO: si no se conecta a
          // destination, la musica deja de sonar
          // por los parlantes.

          analizador.connect(
            contexto.destination
          )


          if (analizadorAudioRef) {

            analizadorAudioRef.current =
              analizador

          }


          fuenteCreada.current =
            true

          elemento.dataset.audioSourceCreado =
            'true'

        } catch (error) {

          // Web Audio API no disponible o bloqueada.
          // La musica sigue sonando de forma normal.

        }

      }

    }


    document.addEventListener(
      'pointerdown',
      iniciar,
      {
        once: true,
      }
    )


    return () => {

      document.removeEventListener(
        'pointerdown',
        iniciar
      )

    }

  }, [])


  const alternar = () => {

    if (!audio.current) return


    if (reproduciendo) {

      audio.current.pause()

      setReproduciendo(
        false
      )

    } else {

      audio.current
        .play()
        .then(() =>
          setReproduciendo(true)
        )
        .catch(() => {})

    }

  }


  return (

    <>

      <audio
        ref={audio}
        src="/galaxy.mp3"
        preload="auto"
      />


      <button
        onClick={alternar}
        aria-label={
          reproduciendo
            ? 'Pausar música'
            : 'Reproducir música'
        }
        style={{

          position: 'fixed',

          right: '28px',

          bottom: '26px',

          zIndex: 100,

          width: '42px',

          height: '42px',

          border:
            '1px solid rgba(100,220,255,0.42)',

          borderRadius: '50%',

          background:
            'rgba(5,10,20,0.42)',

          color:
            '#D9F5FF',

          cursor:
            'pointer',

          backdropFilter:
            'blur(10px)',

          fontSize:
            '17px',

          boxShadow:
            reproduciendo
              ? '0 0 16px rgba(40,210,255,0.25)'
              : 'none',

          transition:
            'all 0.25s ease',

        }}
        onMouseEnter={() => {
          if (cursorModoRef) {
            cursorModoRef.current =
              'hover'
          }
        }}
        onMouseLeave={() => {
          if (cursorModoRef) {
            cursorModoRef.current =
              'default'
          }
        }}
      >

        {
          reproduciendo
            ? '♫'
            : '♪'
        }

      </button>

    </>

  )
}


// =====================================================
// CURSOR PERSONALIZADO
// Solo se activa si hay un mouse real (pointer: fine).
// En touch no se toca absolutamente nada.
// =====================================================

function CursorPersonalizado({
  modoRef,
}) {

  const anillo =
    useRef(null)

  const punto =
    useRef(null)

  const posicionMouse =
    useRef({ x: 0, y: 0 })

  const posicionAnillo =
    useRef({ x: 0, y: 0 })

  const activo =
    useRef(false)

  const [
    soportado,
    setSoportado,
  ] =
    useState(false)


  useEffect(() => {

    const tieneMouse =
      window.matchMedia &&
      window.matchMedia(
        '(pointer: fine)'
      ).matches

    if (tieneMouse) {
      setSoportado(true)
    }

  }, [])


  useEffect(() => {

    if (!soportado) {
      return
    }


    const estilo =
      document.createElement(
        'style'
      )

    estilo.innerHTML =
      '* { cursor: none !important; }'

    document.head.appendChild(
      estilo
    )


    const mover = (e) => {

      posicionMouse.current.x =
        e.clientX

      posicionMouse.current.y =
        e.clientY


      if (!activo.current) {

        activo.current = true

        posicionAnillo.current.x =
          e.clientX

        posicionAnillo.current.y =
          e.clientY

      }


      if (punto.current) {
        punto.current.style.opacity =
          '1'
      }

      if (anillo.current) {
        anillo.current.style.opacity =
          '1'
      }

    }


    const salir = (e) => {

      if (e.relatedTarget) {
        return
      }

      if (punto.current) {
        punto.current.style.opacity =
          '0'
      }

      if (anillo.current) {
        anillo.current.style.opacity =
          '0'
      }

    }


    window.addEventListener(
      'mousemove',
      mover
    )

    document.documentElement.addEventListener(
      'mouseleave',
      salir
    )


    let cuadro = null


    const animar = () => {

      if (
        anillo.current &&
        punto.current
      ) {

        posicionAnillo.current.x +=
          (posicionMouse.current.x -
            posicionAnillo.current.x) *
          0.18

        posicionAnillo.current.y +=
          (posicionMouse.current.y -
            posicionAnillo.current.y) *
          0.18


        const modo =
          modoRef && modoRef.current
            ? modoRef.current
            : 'default'


        let escala = 1

        if (modo === 'hover') {
          escala = 1.7
        } else if (
          modo === 'grabbing'
        ) {
          escala = 0.75
        }


        anillo.current.style.transform =
          'translate3d(' +
          posicionAnillo.current.x +
          'px, ' +
          posicionAnillo.current.y +
          'px, 0) translate(-50%, -50%) scale(' +
          escala +
          ')'

        anillo.current.style.borderColor =
          modo === 'hover'
            ? 'rgba(120,235,255,0.95)'
            : 'rgba(90,215,255,0.55)'

        anillo.current.style.boxShadow =
          modo === 'hover'
            ? '0 0 22px rgba(60,220,255,0.55)'
            : '0 0 10px rgba(60,220,255,0.25)'


        const escalaPunto =
          modo === 'grabbing'
            ? 1.4
            : 1

        punto.current.style.transform =
          'translate3d(' +
          posicionMouse.current.x +
          'px, ' +
          posicionMouse.current.y +
          'px, 0) translate(-50%, -50%) scale(' +
          escalaPunto +
          ')'

      }

      cuadro =
        requestAnimationFrame(
          animar
        )

    }

    cuadro =
      requestAnimationFrame(
        animar
      )


    return () => {

      window.removeEventListener(
        'mousemove',
        mover
      )

      document.documentElement.removeEventListener(
        'mouseleave',
        salir
      )

      if (cuadro) {
        cancelAnimationFrame(
          cuadro
        )
      }

      document.head.removeChild(
        estilo
      )

    }

  }, [soportado])


  if (!soportado) {
    return null
  }


  return (

    <>

      <div
        ref={anillo}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          border:
            '1px solid rgba(90,215,255,0.55)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0,
          transition:
            'opacity 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          willChange: 'transform',
        }}
      />

      <div
        ref={punto}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: '#8FF1FF',
          boxShadow:
            '0 0 6px rgba(120,235,255,0.9)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0,
          transition:
            'opacity 0.2s ease',
          willChange: 'transform',
        }}
      />

    </>
  )
}


// =====================================================
// APP
// =====================================================

export default function App() {

  const [
    camaraActual,
    setCamara,
  ] =
    useState(
      'CAM_HOME'
    )


  // ===================================================
  // ESTADO DE SOBRE MI
  // ===================================================

  const [
    sobreMiAbierto,
    setSobreMiAbierto,
  ] =
    useState(false)


  const abrirSobreMi =
    () => {

      setSobreMiAbierto(
        true
      )

    }


  const cerrarSobreMi =
    () => {

      setSobreMiAbierto(
        false
      )

    }


  // ===================================================
  // PUENTE DE AUDIO PARA LAS PARTICULAS
  // MusicaAmbiental lo llena una vez que el usuario
  // interactua. ParticulasProyector solo lo lee.
  // ===================================================

  const analizadorAudioRef =
    useRef(null)


  // ===================================================
  // MODO DEL CURSOR PERSONALIZADO
  // 'default' | 'hover' | 'grabbing'
  // ===================================================

  const cursorModoRef =
    useRef('default')


  return (

    <>

      <AjustePagina />


      <Canvas

        camera={{
          position: [
            0,
            0,
            5,
          ],

          fov: 50,
        }}


        gl={{

          antialias: true,

          alpha: false,

          toneMapping:
            THREE.ACESFilmicToneMapping,

          toneMappingExposure:
            1.15,

        }}


        shadows={{
          type:
            THREE.PCFSoftShadowMap,
        }}


        dpr={[
          1,
          2,
        ]}


        style={{

          width: '100vw',

          height: '100vh',

          display: 'block',

          position: 'fixed',

          top: 0,

          left: 0,

          background:
            '#020308',

        }}

      >


        {/* =================================================
            ILUMINACION
        ================================================= */}

        <ambientLight
          intensity={1.25}
          color="#B8C7D9"
        />


        <directionalLight

          position={[
            6,
            10,
            6,
          ]}

          intensity={2.3}

          color="#E8F2FF"

          castShadow

          shadow-mapSize-width={
            2048
          }

          shadow-mapSize-height={
            2048
          }

          shadow-camera-near={
            0.5
          }

          shadow-camera-far={
            40
          }

          shadow-camera-left={
            -15
          }

          shadow-camera-right={
            15
          }

          shadow-camera-top={
            15
          }

          shadow-camera-bottom={
            -15
          }

          shadow-bias={
            -0.0001
          }

        />


        <pointLight

          position={[
            -6,
            5,
            4,
          ]}

          intensity={2.2}

          distance={18}

          decay={2}

          color="#3B8DFF"

        />


        <pointLight

          position={[
            5,
            4,
            -4,
          ]}

          intensity={2.8}

          distance={14}

          decay={2}

          color="#22DFFF"

        />


        <spotLight

          position={[
            -5,
            7,
            -6,
          ]}

          intensity={4}

          distance={25}

          angle={0.55}

          penumbra={0.75}

          decay={2}

          color="#176BFF"

          castShadow

        />


        <pointLight

          position={[
            0,
            9,
            0,
          ]}

          intensity={1.5}

          distance={18}

          decay={2}

          color="#DCEBFF"

        />


        {/* =================================================
            PARTICULAS AMBIENTALES
        ================================================= */}

        <ParticulasAmbientales />


        {/* =================================================
            MODELO
        ================================================= */}

        <Modelo

          camaraActual={
            camaraActual
          }

          setCamara={
            setCamara
          }

          abrirSobreMi={
            abrirSobreMi
          }

          analizadorAudioRef={
            analizadorAudioRef
          }

          cursorModoRef={
            cursorModoRef
          }

        />


        {/* =================================================
            POSTPROCESADO
        ================================================= */}

        <EffectComposer>

          <Bloom

            intensity={0.48}

            luminanceThreshold={
              0.62
            }

            luminanceSmoothing={
              0.8
            }

            mipmapBlur

          />


          <Vignette

            eskil={false}

            offset={0.22}

            darkness={0.55}

          />

        </EffectComposer>


      </Canvas>


      {/* =================================================
          HOME
      ================================================= */}

      <HomeButton
        setCamara={
          setCamara
        }
        cursorModoRef={
          cursorModoRef
        }
      />


      <MusicaAmbiental
        analizadorAudioRef={
          analizadorAudioRef
        }
        cursorModoRef={
          cursorModoRef
        }
      />


      {/* =================================================
          TARJETA SOBRE MI
      ================================================= */}

      <SobreMiCard

        visible={
          sobreMiAbierto
        }

        cerrar={
          cerrarSobreMi
        }

        cursorModoRef={
          cursorModoRef
        }

      />


      {/* =================================================
          CURSOR PERSONALIZADO
      ================================================= */}

      <CursorPersonalizado
        modoRef={
          cursorModoRef
        }
      />

    </>

  )
}


// =====================================================
// PRECARGAR MODELO
// =====================================================

useGLTF.preload(
  '/PORTAFOLIO_WEB.glb'
)