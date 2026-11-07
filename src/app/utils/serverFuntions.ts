import { Plan } from "@prisma/client"
import { dict } from "."
import { IAffiliateShow } from "../interfaces/models"

export const getPlanEnum = (id?: number): Plan => {
	let enumerable = Plan.Student
	if (id === 2) return Plan.JobSeeker
	if (id === 3) return Plan.Business
	return enumerable
}

export const templates = {
	forgotPassword: (name: string, url: string) => `
	<h2>Hello ${name}</h2>
	<p>Here is your url to change password</p>
	<a href="${url}">Change password</a>
	`,
	immo: (name: string, url: string, lang: "es" | "en" | "fr") =>
		emailImmoBase(
			`${name} wants to comunicate with you`,
			[`I'm interested on this property`],
			url,
			lang
		),

	contactUs: (name: string, message: string) => `
	<img src="https://libling-assets.s3.eu-west-2.amazonaws.com/carrusel_banner_1_1440.jpg" alt="Banner Libling" style="width:600px;height: 208.33px;">
	<h2>You got a new message from ${name}: </h2>
	<p>${message}</p>
	
	`,

	info: (
		banner: string,
		name: string,
		message: string,
		lang: "es" | "en" | "fr"
	) =>
		emailBase(
			banner,
			`<h2>You got a new message from ${name}: </h2>`,
			[message],
			lang
		),
	infoClient: (
		banner: string,
		name: string | null,
		lang: "es" | "en" | "fr"
	) =>{
		const glosary = dict[lang].mail
		return emailBase(
			banner,
			``,
			[`${glosary.infoContent1}${name ? ' '+name+' ' : ''}${glosary.infoContent2}`],
			lang
		)

	}
		,

	affiliate: (lang: "es" | "en" | "fr") => {
		const glosary = dict[lang].mail
		const glosaryHome = dict[lang].home
		return emailBase(
			glosaryHome.bigTitleHeader1_1 + glosaryHome.bigTitleHeader1_2,
			glosary.affiliateTitle,
			[
				glosary.affiliateContent_1,
				glosary.affiliateContent_2,
				glosary.affiliateContent_3,
				glosary.affiliateContent_4,
				glosary.affiliateContent_5,
			],
			lang
		)
	},
	affiliateAdmin: (lang: "es" | "en" | "fr", affiliate: IAffiliateShow) => {
		const glosary = dict[lang].mail
		const glosaryHome = dict[lang].home
		const glosaryService = dict[lang].services
		const plans = {
			Student: glosaryService.planTitle1,
			JobSeeker: glosaryService.planTitle2,
			Business: glosaryService.planTitle3,
		}
		return emailBase(
			glosaryHome.bigTitleHeader1_1 + glosaryHome.bigTitleHeader1_2,
			glosary.affiliateTitleAdmin,
			[
				glosaryService.inputLabel_1 + ": " + affiliate.name,
				glosaryService.inputLabel_2 + ": " + affiliate.phone,
				glosaryService.inputLabel_3 + ": " + affiliate.email,
				glosaryService.inputLabel_4 + ": " + affiliate.country.name,
				glosaryService.planDate + ": " + affiliate.plan_date.toDateString(),
				glosaryService.plan + ": " + plans[affiliate.plan],
			],
			lang
		)
	},
}
export const subjects = {
	forgotPassword: `Change your password`,
	immo: `Someone is asking for a property`,
}

const emailBase = (
	banner: string,
	title: string,
	text: string[],
	lang: "es" | "en" | "fr"
) => {
	const glosary = dict[lang].mail
	return `
	<!DOCTYPE html>
	<html lang="${lang}">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
		<style>
			
			*{
				font-family: "Poppins","Helvetica Neue","Verdana", sans-serif;
				font-style: normal;
				box-sizing: border-box;
				padding: 0;
				margin: 0;
			}
			.poppins-regular {
				font-weight: 400;
			}
		
			.poppins-medium {
				font-weight: 500;
			}
		
			.title {
				font-weight: 600;
				color: #000000DE;
				font-size: 22px;
			}
		
			.poppins-bold {
				font-weight: 700;
			}
		
			.container {
				min-width: 1024px;
				max-width: 100%;
				height: 1394px;
				position: relative;
				background: #FAFAFA;
			}
		
			.header {
				background: #1973FA;
				min-width: 1024px;
				max-width: 100%;
				height: 194px;
				display: flex;
				padding: 32px;
				justify-content: center;
				align-items: flex-start;
		
			}
		
			.main {
				min-width: 1024px;
				max-width: 100%;
				height: 1200px;
				position: relative;
			}
		
			.logo {
				width: 134px;
				height: 40px;
			}
		
			.bannerImage {
				width: 600px;
				height: 208.33px;
			}
			.card{
				position: relative;
				width: 600px;
				min-height: 600px;
				top: -100px;
				margin: 0px auto;
				box-shadow: 0px 12px 30px 0px #1973FA14;
				border-radius: 10px;
				background-color: #FFF;
				z-index: 2;
				overflow: hidden;
				display: flex;
				flex-direction: column;
			}
			.cardHeader{
				width: 600px;
				height: 208.33px;
				position: relative;
			}
			.cardContent{
				background: #FFFFFF;
				flex-grow: 1;
				padding: 32px;
				display: flex;
				flex-direction: column;
				gap: 40px;
		
			}
			.cardFooter{
				background: #FAFAFA;
				padding: 40px 32px;
				display: flex;
				flex-direction: column;
				gap: 40px;
				justify-content: stretch;
				align-items: center;
			}
			.footerTop{
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				gap: 24px;
				border-bottom: 1px solid #0000001F;
				text-align: center;
				color: #00000099;
				font-size: 16px;
				line-height: 24px;
				padding-bottom: 24px;
			}
			.footerBottom{
				display: flex;
				flex-direction: column;
				gap: 32px;
				text-align: center;
				color: #00000099;
				font-size: 12px;
				line-height: 16px;
		
			}
			.headerTitle{
				position: absolute;
				top: 0;
				left: 40px;
				font-size: 32px;
				color: #00000099;
				font-weight: 500;
				line-height: 40px;
				text-transform: uppercase;
				max-width: 260px;
				padding:64px 0px;
			}
			.socialRow{
				display: flex;
				flex-direction: row;
				gap: 40px;
				align-items: center;
				justify-content: center;
			}
			.icon{
				width: 24px;
				height: 24px;
			}
			.textPrimary{
				color: #1973FA;
			}
			.footerLinks{
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
			}
			.footerText{
				text-align: center;
				color: #00000099;
				font-size: 12px;
				line-height: 16px;
				text-decoration: none;
			}
			.footerTitle{
				color: #1973FA;
				font-weight: 500;
				font-size: 20px;
				line-height: 24px;
				text-align: center;
			}
			.contentTitle{
				font-size: 22px;
				font-weight: 600;
				line-height: 28px;
				text-align: center;
				color: #000000DE;
			}
			.contentText{
				font-size: 14px;
				line-height: 20px;
				color: #00000099;
				display: flex;
				flex-direction: column;
				gap:20px;
			}
		
		</style>
		<title>Document</title>
	</head>
	<body>
		<div class="container">
			<div class="header">
				<img src="https://libling-assets.s3.eu-west-2.amazonaws.com/Recurso+1+1.png" alt="Logotipo" class="logo">
			</div>
			<div class="main">
				<div class="card">
					<div class="cardHeader">
						<img src="https://libling-assets.s3.eu-west-2.amazonaws.com/carrusel_banner_1_1440.jpg" alt="Banner Libling" class="bannerImage">
						<h2 class="headerTitle">
							<span class="textPrimary">${banner}</span>
						</h2>
					</div>
					<div class="cardContent">
						<h1 class="contentTitle">
							${title}
						</h1>
						<p class="contentText">
							${text.map((el) => "<span>" + el + "</span>").join("")}
							<span style="font-weight: 700;">${glosary.contentBottom}</span>
						</p>
					</div>
					<div class="cardFooter">
						<div class="footerTop">
							<a href="https://www.libling.lu/contact">
								<img src="https://libling-assets.s3.eu-west-2.amazonaws.com/message_circle.png" alt="circle icon" class="icon">
							</a>
							<h4 class="footerTitle">${glosary.footerTopTitle}</h4>
							<p>
								<span style="font-weight: 700;">${glosary.footerTopText_1}</span>
								<span>${glosary.footerTopText_2}</span>
								<a class="textPrimary">${glosary.footerTopText_3}</a>
								<span>${glosary.footerTopText_4}</span>
								<span class="textPrimary">${glosary.footerTopText_5}</span>
							</p>
						</div>
						<div class="footerBottom">
							<div class="socialRow">
								<a href="https://www.facebook.com/profile.php?id=61554771181200">
									<img src="https://libling-assets.s3.eu-west-2.amazonaws.com/facebook_24px.png" alt="facebook icon" class="icon" style="width: 22px;">
								</a>
								<a href="#">
									<img src="https://libling-assets.s3.eu-west-2.amazonaws.com/x-twitter_24px.png" alt="twitter icon" class="icon">
								</a>
								<a href="https://www.instagram.com/libling_solutions">
									<img src="https://libling-assets.s3.eu-west-2.amazonaws.com/instagram_24px.png" alt="instagram icon" class="icon" style="width: 19px;">
								</a>
								
							</div>
							<div>
								<p>Email: info@libling.lu</p>
								<p>Autorisation n°10154859/0 /RCS B278845/TVA: LU35451932</p>
								<p>Advice - Management and Relocation to Luxembourg</p>
								<p>Libling Solutions for you</p>
							</div>
							<div class="footerLinks">
								<a class="footerText" href="#">${glosary.footerBottomText_1}</a>
								<a class="footerText" href="#">${glosary.footerBottomText_2}</a>
								<a class="footerText" href="#">${glosary.footerBottomText_3}</a>
								<a class="footerText" href="#">${glosary.footerBottomText_4}</a>
							</div>
						</div>
					</div>
		
		
				</div>
			</div>
		</div>
	</body>
</html>

`
}
const emailImmoBase = (
	title: string,
	text: string[],
	url: string,
	lang: "es" | "en" | "fr"
) => {
	const glosary = dict[lang].mail
	return `
	<!DOCTYPE html>
	<html lang="${lang}">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
		<style>
			
			*{
				font-family: "Poppins","Helvetica Neue","Verdana", sans-serif;
				font-style: normal;
				box-sizing: border-box;
				padding: 0;
				margin: 0;
			}
			.poppins-regular {
				font-weight: 400;
			}
		
			.poppins-medium {
				font-weight: 500;
			}
		
			.title {
				font-weight: 600;
				color: #000000DE;
				font-size: 22px;
			}
		
			.poppins-bold {
				font-weight: 700;
			}
		
			.container {
				min-width: 1024px;
				max-width: 100%;
				height: 1394px;
				position: relative;
				background: #FAFAFA;
			}
		
			.header {
				background: #F98602;
				min-width: 1024px;
				max-width: 100%;
				height: 194px;
				display: flex;
				padding: 32px;
				justify-content: center;
				align-items: flex-start;
		
			}
		
			.main {
				min-width: 1024px;
				max-width: 100%;
				height: 1200px;
				position: relative;
			}
		
			.logo {
				width: 134px;
				height: 40px;
			}
		
			.bannerImage {
				width: 600px;
				height: 208.33px;
			}
			.card{
				position: relative;
				width: 600px;
				min-height: 600px;
				top: -100px;
				margin: 0px auto;
				box-shadow: 0px 12px 30px 0px #1973FA14;
				border-radius: 10px;
				background-color: #FFF;
				z-index: 2;
				overflow: hidden;
				display: flex;
				flex-direction: column;
			}
			.cardHeader{
				width: 600px;
				height: 208.33px;
				position: relative;
			}
			.cardContent{
				background: #FFFFFF;
				flex-grow: 1;
				padding: 32px;
				display: flex;
				flex-direction: column;
				gap: 40px;
		
			}
			.cardFooter{
				background: #F98602;
				padding: 40px 32px;
				display: flex;
				flex-direction: column;
				gap: 40px;
				justify-content: stretch;
				align-items: center;
			}
			.footerTop{
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				gap: 24px;
				border-bottom: 1px solid #0000001F;
				text-align: center;
				color: #FFFFFF;
				font-size: 16px;
				line-height: 24px;
				padding-bottom: 24px;
			}
			.footerBottom{
				display: flex;
				flex-direction: column;
				gap: 32px;
				text-align: center;
				color: #FFFFFFBD;
				font-size: 12px;
				line-height: 16px;
		
			}
			.headerTitle{
				position: absolute;
				top: 0;
				left: 40px;
				font-size: 32px;
				color: #00000099;
				font-weight: 500;
				line-height: 40px;
				text-transform: uppercase;
				max-width: 260px;
				padding:64px 0px;
			}
			.socialRow{
				display: flex;
				flex-direction: row;
				gap: 40px;
				align-items: center;
				justify-content: center;
			}
			.icon{
				width: 24px;
				height: 24px;
			}
			.textPrimary{
				color: #FFFFFF;
			}
			.footerLinks{
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
			}
			.footerText{
				text-align: center;
				color: #00000099;
				font-size: 12px;
				line-height: 16px;
				text-decoration: none;
			}
			.footerTitle{
				color: #fff;
				font-weight: 500;
				font-size: 20px;
				line-height: 24px;
				text-align: center;
			}
			.contentTitle{
				font-size: 22px;
				font-weight: 600;
				line-height: 28px;
				text-align: center;
				color: #000000DE;
			}
			.contentText{
				font-size: 14px;
				line-height: 20px;
				color: #00000099;
				display: flex;
				flex-direction: column;
				gap:20px;
			}
		
		</style>
		<title>Document</title>
	</head>
	<body>
		<div class="container">
			<div class="header">
				<img src="https://libling-assets.s3.eu-west-2.amazonaws.com/Recurso+1+1.png" alt="Logotipo" class="logo">
			</div>
			<div class="main">
				<div class="card">
					<div class="cardHeader">
						<img src="https://libling-assets.s3.eu-west-2.amazonaws.com/immo_header_mail.jpg" alt="Banner Libling" class="bannerImage">
						<h2 class="headerTitle">
							<span class="textPrimary"></span>
						</h2>
					</div>
					<div class="cardContent">
						<h1 class="contentTitle">
							${title}
						</h1>
						<p class="contentText">
							${text.map((el) => "<span>" + el + "</span>").join("")}
							<a style="font-weight: 700;" href="${url}">Click here to see the property</a>
						</p>
					</div>
					<div class="cardFooter">
						<div class="footerTop">
							<a href="https://www.libling.lu/contact">
								<img src="https://libling-assets.s3.eu-west-2.amazonaws.com/message_circle.png" alt="circle icon" class="icon">
							</a>
							<h4 class="footerTitle">${glosary.footerTopTitle}</h4>
							<p>
								<span style="font-weight: 700;">${glosary.footerTopText_1}</span>
								<span>${glosary.footerTopText_2}</span>
								<a class="textPrimary" style="font-weight: 700;">immo@libling.lu</a>
								<span>${glosary.footerTopText_4}</span>
								<span class="textPrimary">${glosary.footerTopText_5}</span>
							</p>
						</div>
						<div class="footerBottom">
							<div class="socialRow">
								<a href="https://www.facebook.com/profile.php?id=61554771181200">
									<img src="https://libling-assets.s3.eu-west-2.amazonaws.com/facebook_24px.png" alt="facebook icon" class="icon" style="width: 22px;">
								</a>
								<a href="#">
									<img src="https://libling-assets.s3.eu-west-2.amazonaws.com/x-twitter_24px.png" alt="twitter icon" class="icon">
								</a>
								<a href="https://www.instagram.com/libling_solutions">
									<img src="https://libling-assets.s3.eu-west-2.amazonaws.com/instagram_24px.png" alt="instagram icon" class="icon" style="width: 19px;">
								</a>
								
							</div>
							<div>
								<p>Email: immo@libling.lu</p>
								<p>Autorisation n°10154859/0 /RCS B278845/TVA: LU35451932</p>
								<p>Advice - Management and Relocation to Luxembourg</p>
								<p>Libling Solutions for you</p>
							</div>
							<div class="footerLinks">
								<a class="footerText" href="#">${glosary.footerBottomText_1}</a>
								<a class="footerText" href="#">${glosary.footerBottomText_2}</a>
								<a class="footerText" href="#">${glosary.footerBottomText_3}</a>
								<a class="footerText" href="#">${glosary.footerBottomText_4}</a>
							</div>
						</div>
					</div>
		
		
				</div>
			</div>
		</div>
	</body>
</html>

`
}
