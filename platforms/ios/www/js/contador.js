init_contadorTa("tarea","contadorTaComentario", 60);
init_contadorTa("input-agregarTarea","contadorTarea", 60);
init_contadorTa("input-agregarObjetivo","contadorObjetivo", 140);
init_contadorTa("input-agregarIndicador","contadorIndicador", 140);
init_contadorTa("input-agregarHito","contadorHito", 140);

function init_contadorTa(idtextarea, idcontador,max)
{
    $("#"+idtextarea).keyup(function()
            {
                updateContadorTa(idtextarea, idcontador,max);
            });

    $("#"+idtextarea).change(function()
    {
            updateContadorTa(idtextarea, idcontador,max);
    });
}

function updateContadorTa(idtextarea, idcontador,max)
{
    var contador = $("#"+idcontador);
    var ta =     $("#"+idtextarea);
    contador.html("0/"+max);

    contador.html(ta.val().length+"/"+max);
    if(parseInt(ta.val().length)>max)
    {
        ta.val(ta.val().substring(0,max-1));
        contador.html(max+"/"+max);
    }

}
