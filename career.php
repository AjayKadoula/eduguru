<?php
session_start();
if(isset($_SESSION["user_name"])){
include './bar\navigation_bar.php';


?>
<!doctype html>
<html lang="eng">
<head>
<meta charset="utf-8">

<title> learn_with_earn</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
<style>
hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid blue;
    margin: 1em 0;
    padding: 0;
}
body{

	background-image: url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwIXqs81nYwzSqqIykOqY56RMBQ-QmK_EB5dMqyyX67yzlJLXH");
}


.banner {
	background:url('img/banner1.jpg') no-repeat 0px 0px;
	background-size:cover;
	min-height:240px;
	padding:45px 0 0 0;
}

.banner h1 {
	color:#fff;
	font-size: 45px;
}
.banner p {
    color: #fff;
    margin: 10px 0 30px 0;
    font-size: 18px;
}
.banner a {
	text-decoration: none;
    color: #fff;
    font-size: 17px;
    background-color: #00b5ff;
    padding: 10px 20px;
}
.banner a:hover {
	background:blue;
}
.body{
	width:100%;
	border: 1px solid blue;
}
.body div{

	background-color:#F9F9F9;
	    margin-bottom: 30px;
    padding: 20px;
    list-style-type: none;
	    transition:0.5s all;
	-webkit-transition:0.5s all;
	-moz-transition:0.5s all;
	-o-transition:0.5s all;
	-ms-transition:0.5s all;
	box-shadow: 0 0 0.6em #ccc;
    -webkit-box-shadow: 0 0 0.6em #ccc;
    -o-box-shadow: 0 0 0.6em #ccc;
    -moz-box-shadow: 0 0 0.6em #ccc;
    -ms-box-shadow: 0 0 0.6em #ccc;
}
.body div:hover{
		background:#fff;
    transition:0.5s all;
	-webkit-transition:0.5s all;
	-moz-transition:0.5s all;
	-o-transition:0.5s all;
	-ms-transition:0.5s all;

}
</style>
</head>
 <body>
 <center>
    <div  style="max-width:80%;">
	<h1>Career</h1><hr>
	<div class="banner text-center">
	  <div class="container">
			<h1 style="margin-top:-20px;">Share Exams Papers & <span class="segment-heading">Exams Notes  </span> With Eduguru</h1>
			<p>****************************************************************</p>
			<div style="margin-top:-10px;"><a href="home.php">Go to Home</a></div>
	  </div>

</div><br><hr><br><br><br>
<div class="body"><br><br>
<a href="exam_directory.php"><div >Career Counsellor	</div></a>
<a href="#"><div>CAREER CHOICE</div></a>
<a href="#"><div>Training / Internship</div></a>
<a href="#"><div>EARN WITH LEARN</div></a>

</div>


<br><br>

<p style="color:black;">© 2018 Eduguru.in AJAY KADOULA</p>
	</div>
</center>
 </body>
</html>

<?php

}else { header("Location:index.php");
}
?>
