import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { es } from 'date-fns/locale';
import { FirebaseContext } from '../../firebase';
import Error404 from '../../components/layout/404';
import Layout from '../../components/layout/Layout';
import { Campo, InputSubmit } from '../../components/ui/Formulario';
import Boton from '../../components/ui/Boton';

const ContenedorProducto = styled.div`
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 2fr 1fr;
    column-gap: 2rem;
  }
`;

const CreadorProducto = styled.p`
  padding: .5rem 2rem;
  background-color: #da552f;
  color: #fff;
  text-transform: uppercase;
  font-weight: bold;
  display: inline-block;
  text-align: center;
`;

const Producto = () => {
  // State del componente
  const [producto, setProducto] = useState({});
  const [error, setError] = useState(false);
  const [comentario, setComentario] = useState({});
  const [consultarDB, setConsultarDB] = useState(true);

  // Routing para obtener el id actual
  const router = useRouter();
  const { query: {id} } = router;

  // Context de Firebase
  const { firebase, usuario } = useContext(FirebaseContext);

  useEffect(() => {
    let isCancelled = false;
    if (id && consultarDB) {
      const obtenerProducto = async () => {
        const productoQuery = await firebase.db.collection('productos').doc(id);
        const producto = await productoQuery.get();
        if (!isCancelled) {
          if (producto.exists) {
            setProducto(producto.data());
            setConsultarDB(false);
          } else {
            setError(true);
            setConsultarDB(false);
          }
        }
      };
      obtenerProducto();
    }
    return () => {
      isCancelled = true;
    }
  }, [id]);

  if (Object.keys(producto).length === 0 && !error) return 'Cargando...';

  const {comentarios, creado, descripcion, empresa, nombre, url, urlImagen, votos, creador, votacion} = producto;

  // Administrar y validar votos
  const handleVotar = () => {
    if (!usuario) {
      return router.push('/login');
    }
    // Obtener y sumar un nuevo voto
    const nuevoTotal = votos + 1;
    // Verificar si el usuario actual ha votado
    if (votacion.includes(usuario.uid)) return;
    // Guardar el ID del usuario que ha votado
    const votantes = [...votacion, usuario.uid];
    // Actualizar en la BD
    firebase.db.collection('productos').doc(id).update({ votos: nuevoTotal, votacion: votantes });
    // Actualizar el State
    setProducto({
      ...producto,
      votos: nuevoTotal
    });
    // Hay un voto, por lo tanto consultar a la BD
    setConsultarDB(true);
  };

  // Funcionalidad para crear comentario
  const changeComentario = e => {
    setComentario({
      ...comentario,
      [e.target.name]: e.target.value
    });
  };

  // Identifica si el comentario es del creador del producto
  const isCreator = id => {
    if (creador.id === id) {
      return true;
    } else {
      return false;
    }
  };

  const submitComentario = e => {
    e.preventDefault();
    if (!usuario) {
      return router.push('/login');
    }
    // Información extra al comentario
    comentario.usuarioId = usuario.uid;
    comentario.usuarioNombre = usuario.displayName;
    // Tomar copia de comentarios y agregarlo al arreglo
    const nuevosComentarios = [...comentarios, comentario];
    // Actualizar la BD
    firebase.db.collection('productos').doc(id).update({
      comentarios: nuevosComentarios
    });
    // Actualizar el State
    setProducto({
      ...producto,
      comentarios: nuevosComentarios
    });
    // Hay un comentario, por lo tanto consultar a la BD
    setConsultarDB(true);
  };

  // Función que revisa que el creador del producto sea el mismo que esta autenticado
  const puedeBorrar = () => {
    if (!usuario) return false;
    if (creador.id === usuario.uid) {
      return true;
    }
  };

  // Elimina un producto de la BD
  const handleEliminarProducto = async () => {
    if (!usuario) {
      return router.push('/login');
    }
    if (creador.id !== usuario.uid) {
      return router.push('/');
    }
    try {
     await firebase.db.collection('productos').doc(id).delete();
     router.push('/'); 
    } catch (error) {

    }
  };

  return (
    <Layout>
      <>
        {error ? <Error404 /> : (
          <div className="contenedor">
            <h1 css={css`
              text-align: center;
              margin-top: 5rem;
            `}>{nombre}</h1>
            <ContenedorProducto>
              <div>
                <p>Publicado hace: {formatDistanceToNow(new Date(creado), {locale: es})}</p>
                <p>Por: {creador.nombre} de <strong>{empresa}</strong></p>
                <img src={urlImagen} alt="img" />
                <p>{descripcion}</p>
                {usuario && (
                  <>
                    <h2>Agrega tu comentario</h2>
                    <form
                      onSubmit={submitComentario}
                    >
                      <Campo>
                        <input
                          type="text"
                          required
                          name="mensaje"
                          onChange={changeComentario}
                        />
                      </Campo>
                      <InputSubmit
                        type="submit"
                        value="Agregar Comentario"
                      />
                    </form>
                  </>
                )}
                <h2 css={css`
                  margin: 2rem 0;
                `}>Comentarios:</h2>
                {comentarios.length === 0 ? 'Aún no hay comentarios' : (
                  <ul>
                    {comentarios.map((comentario, index) => (
                      <li
                        key={`${comentario.usuarioId}-${index}`}
                        css={css`
                          border: 1px solid #e1e1e1;
                          padding: 2rem;
                        `}
                      >
                        <p>{comentario.mensaje}</p>
                        <p>Escrito por: 
                          <span css={css`
                            font-weight: bold;
                          `}
                          >{' '}{comentario.usuarioNombre}</span>
                        </p>
                        {isCreator(comentario.usuarioId) && 
                          <CreadorProducto>Es creador</CreadorProducto>
                        }
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <aside>
                <Boton
                  target="_blank"
                  bgColor="true"
                  href={url}
                >Visitar URL</Boton>
                <div css={css`
                  margin-top: 5rem;
                `}>
                  <p css={css`
                    text-align: center;
                  `}>{votos} votos</p>
                  {usuario && (
                    <Boton
                      onClick={handleVotar}
                    >
                      Votar
                    </Boton>
                  )}
                </div>
              </aside>
            </ContenedorProducto>
            {puedeBorrar() &&
              <Boton
                onClick={handleEliminarProducto}
              >Eliminar Producto</Boton>
            }
          </div>
        )}
      </>
    </Layout>
  );
}
 
export default Producto;