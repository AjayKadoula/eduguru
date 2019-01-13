<?php
session_start();
if(isset($_session["user"])){
header("Refresh:3; URL=profile.php");
}else { header("Location:index.php");
}
?>
<!doctype html>
<html lang="eng">
<head>
<meta charset="utf-8">
<title>Congratulation YOU Successfully Signup</title>
<link rel="stylesheet" href="success.css" type="text/css">
</head>
<body>
<div >
<div class="head">
<a href="#" target="_blank"  style="text-decoration:none;" >
<div class="unotes">
Unotes.in
</div>
</a>
</div>
</div>
<div >
<center><h1><b><strong>WELCOME</strong> </b></h1 >
<?php echo $_POST['fname'].$_POST['sname'] ;?> 
</center>
</div>
<div>
<div class="footer"><p class="p4">© unotes.in 2018 <p> <p class="name">Developed by AJAY KADOULA</p></div>
</div>
</body>
</html>
