import React from 'react'
import styles from './page.module.css'
import globalStyles from '@/app/globals.module.css'
import Image from 'next/image'
import headerImg from '@/app/img/contact_banner.gif'
import familyImg from '@/app/img/CEO_contact.jpg'
import Article from '@/app/components/article'
import { RiWhatsappLine, RiInstagramLine, RiMessengerLine, RiLinkedinFill } from "react-icons/ri";
import Section from '@/app/components/section'
import ContactForm from '@/app/components/form'
import ContactCard from '@/app/components/contactCard'
import { dict } from '@/app/utils'
import { Calendar } from 'react-calendar'
import { poppinsMedium, poppinsRegular } from '@/app/fonts';
import { CalendarEvent } from './calendar'
import ical from 'ical'
import { Metadata } from 'next'
import HeaderContact from '@/app/components/headerContact'
import RelocationForm from '@/app/components/relocationForm'

interface IPage {
  params: Promise<{
    lang: "es" | "en" | "fr"
  }>
}
interface ICalEvent {
  type: string
  params: any[]
  start: Date
  end: Date
  dtstamp: Date
  uid: string
  created: Date
  lastmodified: Date
  sequence: string
  status: string
  summary: string
  transparency: string
}

export const metadata: Metadata = {
  title: 'Relocation - Contact | Libling Solutions',
  description: 'Travel to Luxembourg, providing you with comprehensive service and optimal support in your relocation process to Luxembourg. We are by your side to assist you with whatever you need',
  robots: 'index, follow',
  keywords: ['relocation', 'relocation help', 'experiences on Luxembourg', 'Luxembourg country', 'Libling', 'assist to relocation', 'support to your relocation', 'multilanguages relocation page', 'secure relocation to Luxembourg', 'easy relocation', 'real state on Luxembourg', 'travel to Luxembourg', 'Best option to relocate to Luxembourg', "Relocación","Ayuda para la reubicación","Experiencias en Luxemburgo","Luxemburgo (país)","Asistencia para la reubicación","Apoyo para tu reubicación","Página de reubicación multilingüe","Mudanza segura a Luxemburgo","Mudanza fácil","Bienes raíces en Luxemburgo","Viajar a Luxemburgo","La mejor opción para reubicarse en Luxemburgo","Latinos en Luxemburgo"],
  alternates:
  {
    canonical: "https://libling.lu/contact",
    languages: {
      en: "https://libling.lu/en/contact",
      es: "https://libling.lu/es/contact",
      fr: "https://libling.lu/fr/contact",
    }
  }
}

const getEvents = async (): Promise<ICalEvent[]> => {
  // Si Google Calendar no responde, la pagina de contacto debe seguir cargando.
  try {
    const res = await fetch('https://calendar.google.com/calendar/ical/liblinglc%40gmail.com/public/basic.ics', {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const data = ical.parseICS(await res.text())
    return Object.values(data) as unknown as ICalEvent[]
  } catch (e) {
    console.error('No se pudo cargar el calendario', e)
    return []
  }
}
const Contact: React.FC<IPage> = async props => {
  const params = await props.params;

  const {
    lang
  } = params;

  const glosary = dict[lang]?.contact
  const events: ICalEvent[] | [] = (await getEvents()) || []
  console.log(events?.length)

  return (
    <main className={styles.main}>
      <HeaderContact lang={lang}/>
      <Section backgroundColor='#FFFFFF' vertical={true}>
        <div className={styles.containerForm}>
          <div className={styles.card}>
            <div className={styles.step}>
              <div className={styles.stepTitleContainer}>
                  <span className={styles.stepTitleNumber}> 1 </span>
                  <span className={globalStyles.tinyMediumTitle}>{glosary.formTitle1}</span>
              </div>
              <CalendarEvent calendarTitle={glosary.calendarTitle} events={events} lang={lang} />
            </div>
            <div className={styles.step} id='contactForm'>
              <div className={styles.stepTitleContainer}>
                  <span className={styles.stepTitleNumber}> 2 </span>
                  <span className={globalStyles.tinyMediumTitle}>{glosary.formTitle2}</span>
              </div>
              <RelocationForm lang={lang} />
            </div>
          </div>
        </div>
        <div className={styles.fillDiv}></div>
      </Section>
    </main>
  )
}

export default Contact