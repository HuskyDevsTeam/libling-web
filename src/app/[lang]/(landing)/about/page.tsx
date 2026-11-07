import React from 'react'
import styles from './page.module.css'
import Article, { IArticleContent } from '@/app/components/article'
import Section from '@/app/components/section'
import { dict } from '@/app/utils'
import { Metadata } from 'next'
import HeaderAbout from '@/app/components/headerAbout'
import AnimatedImage from '@/app/components/animatedImage'
import EmbraceIMG from '@/app/img/about_section_1.webp'
import MoveIMG from '@/app/img/about_section_1.webp'
import HelpIMG from '@/app/img/about_section_2.webp'
import HousesIMG from '@/app/img/about_section_3.webp'
interface IPage {
  params: Promise<{
    lang: "es" | "en" | "fr"
  }>
}
export const metadata: Metadata = {
  title: 'Relocation - About Us | Libling Solutions',
  description: 'Travel to Luxembourg, providing you with comprehensive service and optimal support in your relocation process to Luxembourg. We are by your side to assist you with whatever you need',
  robots: 'index, follow',
  keywords: ['relocation', 'relocation help', 'experiences on Luxembourg', 'Luxembourg country', 'Libling', 'assist to relocation', 'support to your relocation', 'multilanguages relocation page', 'secure relocation to Luxembourg', 'easy relocation', 'real state on Luxembourg', 'travel to Luxembourg', 'Best option to relocate to Luxembourg', "Relocación", "Ayuda para la reubicación", "Experiencias en Luxemburgo", "Luxemburgo (país)", "Asistencia para la reubicación", "Apoyo para tu reubicación", "Página de reubicación multilingüe", "Mudanza segura a Luxemburgo", "Mudanza fácil", "Bienes raíces en Luxemburgo", "Viajar a Luxemburgo", "La mejor opción para reubicarse en Luxemburgo", "Latinos en Luxemburgo"],
  alternates:
  {
    canonical: "https://libling.lu/about",
    languages: {
      en: "https://libling.lu/en/about",
      es: "https://libling.lu/es/about",
      fr: "https://libling.lu/fr/about",
    }
  }
}
const Services: React.FC<IPage> = async props => {
  const params = await props.params;

  const {
    lang
  } = params;

  const glosary = dict[lang]?.about
  const content_1: IArticleContent[] = [
    {
      bold: true,
      value: glosary.sectionContent_1_1
    },
    {
      value: glosary.sectionContent_1_2
    },
    {
      bold: true,
      value: glosary.sectionContent_1_3
    },
    {
      value: glosary.sectionContent_1_4
    },
  ]
  const content_2: IArticleContent[] = [
    {
      value: glosary.sectionContent_2_1
    },
    {
      bold: true,
      value: glosary.sectionContent_2_2
    },
    {
      value: glosary.sectionContent_2_3
    },
  ]
  const content_3: IArticleContent[] = [
    {
      bold: true,
      value: glosary.sectionContent_3_1
    },
    {
      value: glosary.sectionContent_3_2
    },
  ]
  const content_4: IArticleContent[] = [
    {
      value: glosary.sectionContent_4
    },
  ]

  return (
    <main className={styles.main}>
      <HeaderAbout lang={lang} />
      <Section>
        <div className={styles.imageDesktop}>
          <AnimatedImage image={EmbraceIMG} alt={'embrace'} reverse={true} />
        </div>
        <Article title={glosary.sectionTitle_1} subtitle={glosary.sectionSubtitle_1} content={content_1} buttonText={glosary.actionButton_1_1} buttonAction='/contact' image={EmbraceIMG} alt={'embrace'} />
      </Section>
      <Section reverse={true}>
        <div className={styles.imageDesktop}>
          <AnimatedImage image={HelpIMG} alt={'help'} />
        </div>
        <Article title={glosary.sectionTitle_2} subtitle={glosary.sectionSubtitle_2} content={content_2} buttonText={glosary.actionButton_2} buttonAction='/contact' image={HelpIMG} alt={'help'} />
      </Section>
      <Section>
        <div className={styles.imageDesktop}>
          <AnimatedImage image={MoveIMG} alt={'move'} reverse={true} />
        </div>
        <Article title={glosary.sectionTitle_3} subtitle={glosary.sectionSubtitle_3} content={content_3} buttonText={glosary.actionButton_3} buttonAction='/contact' image={MoveIMG} alt={'move'} />
      </Section>
      <Section vertical={true} backgroundImage={HousesIMG}>
        <Article title={glosary.sectionTitle_4} subtitle={glosary.sectionSubtitle_4_1 + glosary.sectionSubtitle_4_2} content={content_4} buttonText={glosary.actionButton_4} buttonAction='/contact' center={true} />
      </Section>
    </main>
  )
}

export default Services