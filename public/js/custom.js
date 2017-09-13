$(function() {
  
  var badge = parseInt($('.badge').html(), 10);

  $('#promocodeButton').on('click', function() {
    var input = $('#code').val();
    if (input === '') {
      return false;
    } else {
      $.ajax({
        type: 'POST',
        url: '/promocode',
        data: {
          promocode: input
        },
        success: function(data) {
          var promocodeResponse = $('#promocodeResponse');

          if (data === 0) {
            return promocodeResponse.html('Code doesn\'t exist');
          }

          var promocodeBtn = $('#promocodeButton');
          promocodeBtn.html('Applied');
          promocodeBtn.prop('disabled', true);
          promocodeResponse.html('Successfully applied the code!');
          $('#totalPrice').html(data);
        }
      });
    }
  });

  $('#add-to-cart').on('click', function() {
    var gigId = $('#gig_id').val();

    if (gigId) {
      $.ajax({
        type: 'POST',
        url: '/add-to-cart',
        data: {
          gig_id: gigId
        },
        success: function(data) {
          badge += 1;
          $('.badge').html(badge);
          $('#code').addClass('alert alert-success').html(data);
        }
      });
    }
  });

  $('.remove-item').on('click', function() {
    var gigId = $(this).attr('id');

    if (gigId) {
      $.ajax({
        type: 'POST',
        url: '/remove-item',
        data: {
          gig_id: gigId
        },
        success: function(data) {
          var subTotal = parseInt($('#subTotal').html(), 10);
          subTotal -= data.price;

          if (subTotal === 0) {
            $('.cart').empty();
            $('.cart').html('Cart Empty');
          } else {
            $('#subTotal').html(subTotal);
            $('#totalPrice').html(data.totalPrice);
          }

          badge -= 1;
          $('.badge').html(badge);
          $('#' + gigId).remove();
        }
      });
    }
  });
});