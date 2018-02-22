    function registro(){

     var nombre = document.getElementById('nombre');
     var apellido = document.getElementById('apellido');
     var mail = document.getElementById('email');
     var fecha = document.getElementById('fecha');
     var pass = document.getElementById('pass');
     var boton = document.getElementById('btn_cuenta');
     boton.addEventListener("click", enviarform);

   }

     function enviarform(Nombre, Apellido, Mail, Fecha){

    var m = mail.value;
     var n = nombre.value;
     var a = apellido.value;
     var f = fecha.value;
     var p = pass.value;
     var db = firebase.database();


     if (n == "", a == "", m == "", f == "", p == ""){

      var $toastContent = $('<span><i class="material-icons left" style="color:red;">error</i>Completa todos los campos</span>');
      Materialize.toast($toastContent, 5000);


  }else{
    firebase.auth().createUserWithEmailAndPassword(m, p).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    alert(error.code);
    alert(error.message);

    if(error.code == "auth/invalid-email"){

      var $toastContent = $('<span><i class="material-icons left" style="color:red;">error</i>Escribe un correo electrónico valido.</span>');
      Materialize.toast($toastContent, 5000);
    }
    if(error.code == "auth/email-already-in-use"){

      var $toastContent = $('<span><i class="material-icons left" style="color:red;">error</i>Alguien más esta usando esta cuenta de correo.</span>');
      Materialize.toast($toastContent, 5000);
    }


    // ...
     });


     firebase.auth().onAuthStateChanged(function(user) {
       if (user) {


         console.log("Usuario logeado");
         var data = firebase.auth().currentUser;
         var uid = data.uid;
         console.log(uid);

         db.ref('usuarios/' + uid).set({

         Nombre : n + " " + a,
         Mail : m,
         Fecha : f


           });
         // User is signed in.
       } else {

         console.log("No hay usuario logeado");
         var data = firebase.auth().currentUser;
         var uid = data.uid;
         console.log(uid);
         // No user is signed in.
       }
     });

    }
}
