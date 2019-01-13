





$(document).on('click','.loadmore',function () {
  $(this).text('Loading...');
    var ele = $(this).parent('li');
        $.ajax({
      url: 'loadmore.php',
      type: 'POST',
      data: {
              page:$(this).data('page'),
            },
      success: function(response){
           if(response){
             ele.hide();
                $(".news_list").append(response);
              }
            }
   });
});