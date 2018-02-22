$(function() {
    var datos = [];
    var usuarios = firebase.database().ref("/usuarios");
    usuarios.on('value', function(snapshot) {
      var users = snapshot.val();
      for(user in users) {
        datos.push({
          value: users[user].nombre + ' ' + users[user].apellidos,
          data: users[user].nombre + ' ' + users[user].apellidos
      })
    }
    });

  var currencies = datos;

  // setup autocomplete function pulling from currencies[] array
  $('#input-agregarIntegrante').autocomplete({
    lookup: currencies,
    onSelect: function (suggestion) {
      var thehtml = '<strong>Currency Name:</strong> ' + suggestion.value + ' <br> <strong>Symbol:</strong> ' + suggestion.data;
      $('#outputcontent').html(thehtml);
    }
  });

  $('#asignadoOrden').autocomplete({
    lookup: currencies,
    onSelect: function (suggestion) {
      var thehtml = '<strong>Currency Name:</strong> ' + suggestion.value + ' <br> <strong>Symbol:</strong> ' + suggestion.data;
      $('#outputcontent').html(thehtml);
    }
  });

  $('#asignadoEditarOrden').autocomplete({
    lookup: currencies,
    onSelect: function (suggestion) {
      var thehtml = '<strong>Currency Name:</strong> ' + suggestion.value + ' <br> <strong>Symbol:</strong> ' + suggestion.data;
      $('#outputcontent').html(thehtml);
    }
  });

  $('#encargadoProyecto').autocomplete({
    lookup: currencies,
    onSelect: function (suggestion) {
      var thehtml = '<strong>Currency Name:</strong> ' + suggestion.value + ' <br> <strong>Symbol:</strong> ' + suggestion.data;
      $('#outputcontent').html(thehtml);
    }
  });
});
