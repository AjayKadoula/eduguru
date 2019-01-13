
 $(document).ready( function() { 
/* set the click event handler of a button */
 $('button').click(function(){ 
 /*get the given number in the textbox*/
 var n = document.getElementById("search_box").value; 
 /*set a variable for displaying the result*/ 
 $("#resultfor").html('Search result for ' + n);
 $("#output ").hide();
 $(".loader").html('<img src="img/loading-small.gif" /> Loading Results...'); 
 $("#output").fadeIn(900,0); 
 $.ajax({
 type: "GET",
 url: "loaddata.php ",
 dataType: "text", //expect html to be returned 
 data: {
 name:n
 },
 success: function(data) { 
 $("#body").html(data);
 }
 }); 
 });
 });