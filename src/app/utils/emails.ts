"use server"
import { showAffiliate } from "@/server/data"
import nodemailer from "nodemailer"
import { templates } from "./serverFuntions"
import { langType } from "../interfaces"
import { dict } from "./serverDict"

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_SERVER || "test.net",
	port: 465,
	secure: true,
	auth: {
		user: process.env.MAIL_USER || "REPLACE-WITH-YOUR-ALIAS@YOURDOMAIN.COM",
		pass: process.env.MAIL_PWD || "REPLACE-WITH-YOUR-GENERATED-PASSWORD",
	},
})
export const sendEmailToOwner = async (
	from: string,
	message: string,
	subject: string
) => {
	transporter.verify(function (error, success) {
		if (error) {
			console.log(error)
		} else {
			console.log("Server is ready to take our messages")
		}
	})
	console.log('env variables... ',from,subject)
	const info = await transporter.sendMail({
		from, // sender address
		replyTo:from, // sender address
		to: '"Libling solutions" <info@libling.lu>', // list of receivers
		subject: subject, // Subject line
		html: `${message}`, // html body
	})
	return info
}
export const sendEmailToClient = async (
	to: string,
	message: string,
	subject: string
) => {
	transporter.verify(function (error, success) {
		if (error) {
			console.log(error)
		} else {
			console.log("Server is ready to take our messages")
		}
	})
	console.log('env variables... ',to,subject)
	const info = await transporter.sendMail({
		from:'"Libling solutions" <no-reply@libling.lu>', // sender address
		replyTo:'"Libling solutions" <info@libling.lu>', // sender address
		to, // list of receivers
		subject: subject, // Subject line
		html: `${message}`, // html body
	})
	return info
}
export const sendAffiliateAdmin = async (
	from: string,
	message: string,
	subject: string
) => {
	transporter.verify(function (error, success) {
		if (error) {
			console.log(error)
		} else {
			console.log("Server is ready to take our messages")
		}
	})
	console.log('env variables... ',from,subject)
	const info = await transporter.sendMail({
		from: '"Libling solutions" <no-reply@libling.lu>', // sender address
		replyTo:from, // sender address
		to: '"Libling solutions" <affiliate@libling.lu>', // list of receivers
		subject: subject, // Subject line
		html: `${message}`, // html body
	})
	return info
}
export const sendAffiliate = async (
	to: string,
	message: string,
	subject: string
) => {
	transporter.verify(function (error, success) {
		if (error) {
			console.log(error)
		} else {
			console.log("Server is ready to take our messages")
		}
	})
	console.log('env variables... ',to,subject)
	const info = await transporter.sendMail({
		from:'"Libling solutions" <no-reply@libling.lu>', // sender address
		replyTo:'"Libling solutions" <affiliate@libling.lu>', // sender address
		to, // list of receivers
		subject, // Subject line
		html: `${message}`, // html body
	})
	console.log('email sent: ', info)
	return info
}
export const sendInfo = async (
	from: string,
	message: string,
	subject: string
) => {
	transporter.verify(function (error, success) {
		if (error) {
			console.log(error)
		} else {
			console.log("Server is ready to take our messages")
		}
	})
	const info = await transporter.sendMail({
		from:'no-reply@libling.lu',
		replyTo:from,
		to: '"Libling Immo" <immo@libling.lu>', // list of receivers
		subject: subject, // Subject line
		html: `${message}`, // html body
	})
	console.log(JSON.stringify(info))
	return info
}
export const sendImmoConfirmation = async (
	to: string,
	message: string,
	subject: string
) => {
	transporter.verify(function (error, success) {
		if (error) {
			console.log(error)
		} else {
			console.log("Server is ready to take our messages")
		}
	})
	const info = await transporter.sendMail({
		from:'no-reply@libling.lu',
		replyTo:'"Libling Immo" <immo@libling.lu>',
		to, // list of receivers
		subject: subject, // Subject line
		html: `${message}`, // html body
	})
	console.log(JSON.stringify(info))
	return info
}
export const assertAffiliate = async (id:number, lang:langType)=>{
		const affiliateShow = await showAffiliate({id})
		const glosaryMail = dict[lang].mail
		if(affiliateShow) {
			await sendAffiliateAdmin(
				affiliateShow?.email || 'email',
				templates.affiliateAdmin(lang, affiliateShow),
				glosaryMail.affiliateTitle
			)
			await sendAffiliate(
				affiliateShow?.email || 'email',
				templates.affiliate(lang),
				glosaryMail.affiliateTitle
			)
		}
}