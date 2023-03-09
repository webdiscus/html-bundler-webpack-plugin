document.addEventListener('DOMContentLoaded', () => {
  // watch test: change me
  const id = '123';

  console.log('>> app', { id, bootstrapModal: $.fn.modal });

  $('.btn-modal').on('click', () => {
    $('#exampleModal').modal('show');
  });
});
