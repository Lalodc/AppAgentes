const db = firebase.database(),
      auth = firebase.auth(),
      storage = firebase.storage();

function logout() {
  auth.signOut();
}

$(document).ready(function() {
  $('.input-group.date').datepicker({
    autoclose: true,
    format: "dd/mm/yyyy",
    language: "es"
  });

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });

  $('#tabPerfil').on('shown.bs.tab', function (e) {
    mostrarDatosPerfil();
  })

  $('#collapseContraseña').on('show.bs.collapse', function () {
    $('#btnExpandir').text('Cerrar');
  })

  $('#collapseContraseña').on('hide.bs.collapse', function () {
    $('#btnExpandir').text('Expandir');
  });

  $('.radioBtn a').on('click', function() {
    var sel = $(this).data('title');
    var tog = $(this).data('toggle');
    $(this).parent().next('.' + tog).prop('value', sel);
    $(this).parent().find('a[data-toggle="' + tog + '"]').not('[data-title="' + sel + '"]').removeClass('active').addClass('notActive');
    $(this).parent().find('a[data-toggle="' + tog + '"][data-title="' + sel + '"]').removeClass('notActive').addClass('active');
  });
});

function mostrarDatosPerfil() {
  let uid = auth.currentUser.uid;
  let usuariosRef = db.ref(`usuarios/tiendas/supervisoras/${uid}`);
  usuariosRef.on('value', function(snapshot) {
    let usuario = snapshot.val();
    $('#nombrePerfil').val(usuario.nombre);
    $('#nombreUsuario').val(usuario.username);
  });
}

$('#btnHabilitarEditar').click(function(e) {
  e.preventDefault();
  $('#nombrePerfil').removeAttr('readonly');
  $('#nombreUsuario').removeAttr('readonly');
  $('#btnEditarPerfil').attr('disabled', false);
  $('#btnHabilitarEditar').attr('disabled', true);
});

function editarPerfil() {
  let uid = auth.currentUser.uid, nombre = $('#nombrePerfil').val(), usuario = $('#nombreUsuario').val();

  if(nombre.length > 0 && usuario.length > 0) {
    let usuariosRef = db.ref(`usuarios/tiendas/supervisoras/`);
    usuariosRef.child(uid).update({
      nombre: nombre,
      usuario: usuario
    }, function() {
      mostrarDatosPerfil();
      $('#nombrePerfil').attr('readonly', true);
      $('#nombreUsuario').attr('readonly', true);
      $('#btnEditarPerfil').attr('disabled', true);
      $('#btnHabilitarEditar').attr('disabled', false);

      $.toaster({ priority : 'success', title : 'Mensaje de información', message : 'Se actualizaron sus datos con exito'});
    });
  }
  else {
    if(nombre.length < 0 ) {
      $('#nombrePerfil').parent().addClass('has-error');
      $('#helpblockNombrePerfil').show();
    }
    else {
      $('#nombrePerfil').parent().removeClass('has-error');
      $('#helpblockNombrePerfil').hide();
    }
    if(usuario.length < 0) {
      $('#nombreUsuario').parent().addClass('has-error');
      $('#helpblockNombreUsuario').show();
    }
    else {
      $('#nombreUsuario').parent().removeClass('has-error');
      $('#helpblockNombreUsuario').hide();
    }
  }
}

$('#btnEditarPerfil').click(function (e) {
  e.preventDefault();
  editarPerfil();
})

function cambiarContraseña() {
  let nuevaContraseña = $('#nuevaContraseña').val();

  if(nuevaContraseña.length > 0) {
    auth.currentUser.updatePassword(contraseñaNueva)
    .then(function () {
      $.toaster({ priority : 'success', title : 'Mensaje de información', message : 'Se actualizó su contraseña exitosamente'});
      $('#nuevaContraseña').parent().removeClass('has-error');
      $('#helpblockNuevaContraseña').hide();
    }, function(error) {
      $.toaster({ priority : 'danger', title : 'Error al cambiar contraseña', message : 'La contraseña debe ser de 8 caracteres como mínimo y puede contener números y letras'});
      console.log(error);
      $('#nuevaContraseña').parent().addClass('has-error');
      $('#helpblockNuevaContraseña').show();
    });
  }
  else {
    $('#nuevaContraseña').parent().addClass('has-error');
    $('#helpblockNuevaContraseña').show();
  }
}

function mostrarNotificaciones() {
  let usuario = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/tiendas/'+usuario+'/lista');
  notificacionesRef.on('value', function(snapshot) {
    let lista = snapshot.val();
    let trs = "";

    let arrayNotificaciones = [];
    for(let notificacion in lista) {
      arrayNotificaciones.unshift(lista[notificacion]);
    }

    //arrayNotificaciones.reverse();

    for(let i in arrayNotificaciones) {
      let date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      let fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      trs += '<tr><td>'+arrayNotificaciones[i].mensaje +' '+fecha+'</td></tr>'
    }

    $('#notificaciones').empty().append(trs);
  });
}

/*function mostrarContador() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/tiendas/'+uid);
  notificacionesRef.on('value', function(snapshot) {
    let cont = snapshot.val().cont;

    if(cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    }
    else {
      $('#spanNotificaciones').hide();
    }
  });
}*/

function verNotificaciones() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/tiendas/'+uid);
  notificacionesRef.update({cont: 0});
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user != null) {
      mostrarNotificaciones();
      

      let uid = auth.currentUser.uid;
      db.ref(`usuarios/administrativo/ventas/agentes/${uid}`).on('value', (datos) => {
        let nombre = datos.val().nombre;

        db.ref('pedidoPadre').on('value', (pedidosPadre) => {
          let datosPedido = pedidosPadre.val();
          if(datosPedido.estado == "Verificado" || datosPedido.estado == "Cargado") {
            //localStorage.setItem('pedidosPadre', JSON.stringify(datosPedido));
            localforage.setItem('pedidosPadre', datosPedido, err => {
              console.log(err ? err : 'Pedidos padre guardadas en localforage')
              mostrarPedidos();
            });
          }
        });
      });
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

function obtenerRegion() {
  let uid = auth.currentUser.uid;
  let rutaUsuarios = db.ref(`usuarios/administrativo/ventas/agentes/${uid}`);
  rutaUsuarios.once('value', function(snapshot) {
    let region = snapshot.val().region;
    $('.region p').html(`Pedidos Región ${region}`);
  });
}

haySesion();

$('#btnPedidos').on('shown.bs.tab', function (e) {
  mostrarPedidos();
});

$('#btnPedidosChecados').on('shown.bs.tab', function (e) {
  mostrarPedidosChecados();
});

function mostrarPedidos() {
  let uid = auth.currentUser.uid;

  let rutaAgentes = db.ref(`usuarios/administrativo/ventas/agentes/${uid}`);
  rutaAgentes.on('value', function(datos) {
    let nombre = datos.val().nombre;
    //let pedidosPadre = JSON.parse(localStorage.getItem('pedidosPadre'));
    localforage.getItem('pedidosPadre', (err, value) => {
      console.log('Obteniendo pedidos padre de localforage');
      let pedidosPadre = value;

      let filas = "";

      for(let pedidoPadre in pedidosPadre) {
        if(pedidosPadre[pedidoPadre].agente == nombre) {
          let pedidosHijos = pedidosPadre[pedidoPadre].pedidosHijos;
          for(let pedido in pedidosHijos) {
            let encabezado = pedidosHijos[pedido].encabezado;
            let detalle = pedidosHijos[pedido].detalle;

            let cantidadProductos = Object.keys(detalle).length;
               
            if(encabezado.checado != true) {
              filas += `<tr>
                          <td>${encabezado.clave}</td>
                          <td>${encabezado.tienda}</td>
                          <td>${cantidadProductos}</td>
                          <td>${encabezado.totalPiezas}</td>
                          <td>${encabezado.totalKilos}</td>
                          <td><a onclick="verificarPedido('${pedidoPadre}', '${pedido}')" class="btn btn-primary btn-xs" href="#pedido" aria-controls="pedido" role="tab" data-toggle="tab"><i class="material-icons">remove_red_eye</i></a></td>
                        </tr>`;
            }
          }
        } 
      }
      $('#tablaPedidos tbody').html(filas);
    });
  });
}

function mostrarPedidosChecados() {
  let uid = auth.currentUser.uid;
  let rutaAgentes = db.ref(`usuarios/administrativo/ventas/agentes/${uid}`);
  rutaAgentes.on('value', function(datos) {
    let nombre = datos.val().nombre;
    localforage.getItem('pedidosPadre', (err, value) => {
      console.log('Obteniendo pedidos padre de localforage');
      let pedidosPadre = value;

      let filas = "";
      for(pedidoPadre in pedidosPadre) {
        if(pedidosPadre[pedidoPadre].agente == nombre) {
          let pedidosHijos = pedidosPadre[pedidoPadre].pedidosHijos;

          for(let pedido in pedidosHijos) {
            let encabezado = pedidosHijos[pedido].encabezado;
            let detalle = pedidosHijos[pedido].detalle;
            let cantidadProductos = Object.keys(detalle).length;
            if(encabezado.checado == true) {
            filas += `<tr>
                        <td>${encabezado.clave}</td>
                        <td>${encabezado.tienda}</td>
                        <td>${cantidadProductos}</td>
                        <td>${encabezado.totalPiezas}</td>
                        <td>${encabezado.totalKilos}</td>
                        <td><a onclick="verChecado('${pedidoPadre}', '${pedido}')" class="btn btn-success btn-xs" href="#pedidoChecado" aria-controls="pedidoChecado" role="tab" data-toggle="tab"><i class="material-icons">remove_red_eye</i></a></td>
                      </tr>`;
            }
          }
        }
      }
      $('#tablaPedidosChecados tbody').html(filas);
    });
  });
}

function verificarPedido(idPedidoPadre, idPedido) {
  /* let pedidoPadre = JSON.parse(localStorage.getItem('pedidosPadre'))[idPedidoPadre]; */
  localforage.getItem('pedidosPadre', (err, value) => {
    console.log('Obteniendo pedidos padre de localforage');
    let pedidoPadre = value[idPedidoPadre];
    let pedidoHijo = pedidoPadre.pedidosHijos[idPedido];

    $('#btnChecarPedido').attr('onclick', `comprobarPedido('${idPedidoPadre}', '${idPedido}')`);
    $('#tienda').val(pedidoHijo.encabezado.tienda);
    $('#consorcio').val(pedidoHijo.encabezado.consorcio);

    let disabled;
    if(pedidoPadre.estado == "Verificado") {
      disabled = "disabled";
      $('#alertaVerificado').html('Este pedido aún no ha sido cargado en almacén').removeClass('hidden');
    }
    else if(pedidoPadre.estado == "Cargado") {
      disabled = "";
      $('#alertaVerificado').addClass('hidden');
    }

    let productos = pedidoHijo.detalle;
    let filasPedido = "", filasDegus = "", filasCambioFisico = "";
    for(let producto in productos) {
      filasPedido += `<tr id="${producto}">
                        <td>${productos[producto].clave}</td>
                        <td>${productos[producto].nombre}</td>
                        <td>${productos[producto].pedidoPz}</td>
                        <td>${productos[producto].pedidoKg}</td>
                        <td><input class="form-control inputPzPedidoEnt" type="number" ${disabled}</td>
                        <td><input class="form-control inputKgPedidoEnt" type="number" ${disabled}></td>  
                      </tr>`;

      filasDegus += `<tr id="${producto}">
                      <td>${productos[producto].clave}</td>
                      <td>${productos[producto].nombre}</td>
                      <td>${productos[producto].degusPz}</td>
                      <td>${productos[producto].degusKg}</td>
                      <td><input class="form-control inputPzDegusEnt" type="number" ${disabled}</td>
                      <td><input class="form-control inputKgDegusEnt" type="number" ${disabled}></td>
                    </tr>`;

      filasCambioFisico += `<tr id="${producto}">
                              <td>${productos[producto].clave}</td>
                              <td>${productos[producto].nombre}</td>     
                              <td>${productos[producto].cambioFisicoPz}</td>
                              <td>${productos[producto].cambioFisicoKg}</td>
                              <td><input class="form-control inputPzCambioFisicoEnt" type="number" ${disabled}</td>
                              <td><input class="form-control inputKgCambioFisicoEnt" type="number" ${disabled}></td>
                            </tr>`;
    }

    $('#tablaProductosPedido tbody').html(filasPedido);
    $('#tablaProductosDegustacion tbody').html(filasDegus)
    $('#tablaProductosCambioFisico tbody').html(filasCambioFisico)
  });
}

function verChecado(idPedidoPadre, idPedido) {
  //let pedidoPadre = JSON.parse(localStorage.getItem('pedidosPadre'))[idPedidoPadre];
  localforage.getItem('pedidosPadre', (err, value) => {
    console.log('Obteniendo pedidos padre de localforage');
    let pedidoPadre = value[idPedidoPadre];
    let pedidoHijo = pedidoPadre.pedidosHijos[idPedido];

    $('#tiendaChecado').val(pedidoHijo.encabezado.tienda);
    $('#consorcioChecado').val(pedidoHijo.encabezado.consorcio);

    let productos = pedidoHijo.detalle;
    let filasPedido = "", filasDegus = "", filasCambioFisico = "";
    for(let producto in productos) {
      filasPedido += `<tr id="${producto}">
                        <td>${productos[producto].clave}</td>
                        <td>${productos[producto].nombre}</td>
                        <td>${productos[producto].pedidoPz}</td>
                        <td>${productos[producto].pedidoKg}</td>
                        <td>${productos[producto].pzPedidoEnt}</td>
                        <td>${productos[producto].kgPedidoEnt}</td>
                      </tr>`;

      filasDegus += `<tr id="${producto}">
                      <td>${productos[producto].clave}</td>
                      <td>${productos[producto].nombre}</td>
                      <td>${productos[producto].degusPz}</td>
                      <td>${productos[producto].degusKg}</td>
                      <td>${productos[producto].pzDegusEnt}</td>
                      <td>${productos[producto].kgDegusEnt}</td>
                    </tr>`;

      filasCambioFisico += `<tr id="${producto}">
                              <td>${productos[producto].clave}</td>
                              <td>${productos[producto].nombre}</td>
                              <td>${productos[producto].cambioFisicoPz}</td>
                              <td>${productos[producto].cambioFisicoKg}</td>
                              <td>${productos[producto].pzCambioFisicoEnt}</td>
                              <td>${productos[producto].kgCambioFisicoEnt}</td>
                            </tr>`;
    }

    $('#tablaProductosPedidoChecado tbody').html(filasPedido);
    $('#tablaProductosDegusChecado tbody').html(filasDegus);
    $('#tablaProductosCambioFisicoChecado tbody').html(filasCambioFisico);
  });
}

function comprobarPedido(idPedidoPadre, idPedido) {
  swal({
    title: "¿Está seguro que desea finalizar este pedido?",
    text: "Esta operación no podrá deshacerse.",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      checarPedido(idPedidoPadre, idPedido);

      swal("El pedido se ha finalizado con exito", {
        icon: "success",
      });
    }
  });
}

function checarPedido(idPedidoPadre, idPedido) {
  let ids = [];
  let kgPedidoEnt = [], pzPedidoEnt = []
      kgDegusEnt = [], pzDegusEnt = []
      kgCambioFisicoEnt = [], pzCambioFisicoEnt = [];

  $('#tablaProductosPedido tbody tr').each(function() {
    ids.push($(this).attr('id'));
  });

  $('.inputKgPedidoEnt').each(function() {
    kgPedidoEnt.push(Number($(this).val()));
  });

  $('.inputPzPedidoEnt').each(function() {
    pzPedidoEnt.push(Number($(this).val()));
  });

  $('.inputKgDegusEnt').each(function() {
    if($(this).val().length > 0) {
      kgDegusEnt.push(Number($(this).val()));
    }
    else {
      kgDegusEnt.push(0);
    }
  });

  $('.inputPzDegusEnt').each(function() {
    if($(this).val().length > 0) {
      pzDegusEnt.push(Number($(this).val()));
    }
    else {
      pzDegusEnt.push(0);
    }
  });

  $('.inputKgCambioFisicoEnt').each(function() {
    if($(this).val().length > 0) {
      kgCambioFisicoEnt.push(Number($(this).val()));
    }
    else {
      kgCambioFisicoEnt.push(0);
    }
  });

  $('.inputPzCambioFisicoEnt').each(function() {
    if($(this).val().length > 0) {
      pzCambioFisicoEnt.push(Number($(this).val()));
    }
    else {
      pzCambioFisicoEnt.push(0);
    }
  });

  var i = 0,
  length = ids.length;
  for (i; i < length; i++) {
    let rutaProducto = db.ref(`pedidoPadre/${idPedidoPadre}/pedidosHijos/${idPedido}/detalle/${ids[i]}`);
    rutaProducto.update({
      kgPedidoEnt: kgPedidoEnt[i],
      pzPedidoEnt: pzPedidoEnt[i],
      kgDegusEnt: kgDegusEnt[i],
      pzDegusEnt: pzDegusEnt[i],
      kgCambioFisicoEnt: kgCambioFisicoEnt[i],
      pzCambioFisicoEnt: pzCambioFisicoEnt[i]
    });
  }
  let rutaPedidoHijo = db.ref(`pedidoPadre/${idPedidoPadre}/pedidosHijos/${idPedido}/encabezado/`);
  rutaPedidoHijo.update({
    checado: true
  });

  $('#btnPedidos').tab('show');

  $('.inputKilosEnt').val('');
  $('.inputPiezasEnt').val('');
  $.toaster({ priority : 'success', title : 'Mensaje', message : 'Se ha verificado el pedido'});
}

function limpiarCampos() {
  $('#productos').val($('#productos > option:first').val());
  $('#productos').focus();
  $('#clave').val('');
  $('#claveConsorcio').val('');
  $('#pedidoPz').val('');
  $('#degusPz').val('');
  $('#cambioFisico').val('');
  $('#totalPz').val('');
  $('#totalKg').val('')
  $('#precioUnitario').val('');
  $('#unidad').val('');
}