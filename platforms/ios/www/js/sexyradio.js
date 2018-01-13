$('.container').on('click', '.radioBtn a', function() {
  var sel = $(this).data('title');
  var tag = $(this).data('toggle');
  $(this).parent().next('.' + tag).prop('value', sel);
  $(this).parent().find('a[data-toggle="' + tag + '"]').not('data-title="'+sel+'"]').removeClass('active').addClass('notActive');
  $(this).parent().find('a[data-toggle="' + tag + '"][data-title="'+sel+'"]').removeClass('notActive').addClass('active');
})
