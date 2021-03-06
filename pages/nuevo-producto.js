import React, { useEffect, useState, useContext } from 'react';
import { css } from '@emotion/react';
import Router, { useRouter } from 'next/router';
import FileUploader from 'react-firebase-file-uploader';
import Layout from '../components/layout/Layout';
import { Campo, Formulario, InputSubmit, Error } from '../components/ui/Formulario';
// Firebase
import { FirebaseContext } from '../firebase/index';
// Validaciones
import useValidation from '../hooks/useValidation';
import validarCrearProducto from '../validacion/validarCrearProducto';
import Error404 from '../components/layout/404';

const INITIAL_STATE = {
  nombre: '',
  empresa: '',
  // imagen: '',
  url: '',
  descripcion: ''
};

const NuevoProducto = () => {

  // State de las imagenes
  const [nombreImagen, setNombreImagen] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [urlImagen, setUrlImagen] = useState('');

  const [error, setError] = useState(false);

  const {
    valores,
    errores,
    handleSubmit,
    handleChange,
    handleBlur
  } = useValidation(INITIAL_STATE, validarCrearProducto, crearProducto);

  const {nombre, empresa, imagen, url, descripcion} = valores;
  // Hook de Routing para redireccionar
  const router = useRouter();
  // Context con las operaciones CRUD de Firebase
  const { usuario, firebase } = useContext(FirebaseContext);

  useEffect(() => {
    firebase.auth.onAuthStateChanged(user => {
      if (!user) {
        return router.push('/login');
      }
    });
  }, []);

  async function crearProducto() {
    // Si el usuario no esta autenticado, llevar al login
    if (!usuario) {
      return router.push('/login');
    }
    // Crear el objeto del nuevo producto
    const producto = {
      nombre,
      empresa,
      url,
      urlImagen,
      descripcion,
      votos: 0,
      comentarios: [],
      creado: Date.now(),
      creador: {
        id: usuario.uid,
        nombre: usuario.displayName
      },
      votacion: []
    }
    // Insertar en la base de datos
    firebase.db.collection('productos').add(producto);

    return router.push('/');
  };

  const handleUploadStart = () => {
    setProgreso(0);
    setSubiendo(true);
  };

  const handleProgress = progreso => setProgreso({progreso});

  const handleUploadError = error => {
    setSubiendo(error);
  };

  const handleUploadSuccess = nombre => {
    setProgreso(100);
    setSubiendo(false);
    setNombreImagen(nombre);
    firebase
      .storage
      .ref(`productos`)
      .child(nombre)
      .getDownloadURL()
      .then(url => {
        setUrlImagen(url);
      });
  };

  return (
    <div>
      <Layout>
        {!usuario ? <Error404 /> : (
          <>
            <h1 css={css`
              text-align: center;
              margin-top: 5rem;
            `}>
              Nuevo Producto
            </h1>
            <Formulario onSubmit={handleSubmit}
              noValidate>
              <fieldset>
                <legend>Informaci??n General</legend>
                <Campo>
                  <label htmlFor="nombre">Nombre</label>
                  <input type="text" id="nombre" placeholder="Nombre del Producto" name="nombre"
                    value={nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}/>
                </Campo>
                {errores.nombre && <Error>{errores.nombre}</Error>}
                <Campo>
                  <label htmlFor="empresa">Empresa</label>
                  <input type="text" id="empresa" placeholder="Nombre empresa" name="empresa"
                    value={empresa}
                    onChange={handleChange}
                    onBlur={handleBlur}/>
                </Campo>
                {errores.empresa && <Error>{errores.empresa}</Error>}
                <Campo>
                  <label htmlFor="imagen">Imagen</label>
                  <FileUploader
                    accept="image/*"
                    id="imagen"
                    name="imagen"
                    randomizeFilename
                    storageRef={firebase.storage.ref("productos")}
                    onUploadStart={handleUploadStart}
                    onUploadError={handleUploadError}
                    onUploadSuccess={handleUploadSuccess}
                    onProgress={handleProgress}
                  />
                </Campo>
                <Campo>
                  <label htmlFor="url">Url</label>
                  <input type="text" id="url" placeholder="URL de tu producto" name="url"
                    value={url}
                    onChange={handleChange}
                    onBlur={handleBlur}/>
                </Campo>
                {errores.url && <Error>{errores.url}</Error>}
              </fieldset>
              <fieldset>
                <legend>Sobre tu producto</legend>
                <Campo>
                  <label htmlFor="descripcion">Descripci??n</label>
                  <textarea type="text" id="descripcion" placeholder="Descripci??n de tu producto" name="descripcion"
                    value={descripcion}
                    onChange={handleChange}
                    onBlur={handleBlur}/>
                </Campo>
                {errores.descripcion && <Error>{errores.descripcion}</Error>}
              </fieldset>
              {error && <Error>{error}</Error>}
              <InputSubmit type="submit" value="Crear Producto"/>
            </Formulario>
          </>
        )}
      </Layout>
    </div>
  )
};

export default NuevoProducto;
