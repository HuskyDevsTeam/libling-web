'use client'
import React, { use } from 'react';
import styles from './page.module.css'
import globalStyles from '@/app/globals.module.css'
import HighlightIMG1 from '@/app/img/Ellipse1.jpg'
import HighlightIMG2 from '@/app/img/Ellipse2.jpg'
import HighlightIMG3 from '@/app/img/Ellipse3.jpg'
import HighlightIMG4 from '@/app/img/Ellipse4.jpg'
import { poppinsBold, poppinsRegular, poppinsSemiBold } from '@/app/fonts'
import Article, { IArticleContent } from '@/app/components/article'
import Section from '@/app/components/section'
import Highlight from '@/app/components/highlight'
import { dict } from '@/app/utils'
import useWindowDimensions from '@/app/hooks/useWindowDimensions'
import HeaderHome from '@/app/components/headerHome'
import PartnerSlider from '@/app/components/partnerSlider'
import AnimatedImage from '@/app/components/animatedImage'
import AsesoramientoIMG from '@/app/img/asesoramiento.jpeg'
import ConoceIMG from '@/app/img/conoce.png'
import AyudaIMG from '@/app/img/ayuda.jpeg'
interface IPage {
  params: Promise<{
    lang: "es" | "en" | "fr"
  }>
}
const Home: React.FC<IPage> = props => {
  const params = use(props.params);

  const {
    lang
  } = params;

  const glosary = dict[lang]?.home
  const { height, width } = useWindowDimensions();

  const listaBeneficios = [
    {
      title: glosary.sectionList_3[0],
      img: HighlightIMG1
    },
    {
      title: glosary.sectionList_3[1],
      img: HighlightIMG2
    },
    {
      title: glosary.sectionList_3[2],
      img: HighlightIMG3
    },
    {
      title: glosary.sectionList_3[3],
      img: HighlightIMG4
    },
  ]
  const content_1:IArticleContent[] = [
    {
      value:glosary.sectionContent_1
    },
  ]
  const content_2:IArticleContent[] = [
    {
      value:glosary.sectionContent_2
    },
  ]
  return (
    <main className={styles.main}>

      <HeaderHome lang={lang}/>
      <Section backgroundColor='#fff' vertical={true}>
        <h4 className={[globalStyles.miniTitle, globalStyles.textPrimary].join(' ')} style={{...poppinsSemiBold.style, paddingRight:16, paddingLeft:16, textAlign:'center'}}>{glosary.sectionPartners}</h4>
        <div className={styles.mobileContainer}>
          <PartnerSlider/>
        </div>
      </Section>
      <Section backgroundColor='#EDF0F4'>
        <Article title={glosary.sectionMiniTitle_1} subtitle={glosary.sectionTitle_1} content={content_1} buttonText={glosary.sectionButton_1} buttonAction='/contact' image={AyudaIMG} alt={glosary.sectionTitle_1} />
        <div className={styles.imageDesktop}>
          <AnimatedImage image={AyudaIMG} alt={glosary.sectionTitle_1}/>
        </div>
      </Section>
      <Section reverse={true} backgroundColor='#EDF0F4'>
        <Article title={glosary.sectionMiniTitle_2} subtitle={glosary.sectionTitle_2} content={content_2} buttonText={glosary.sectionButton_2} buttonAction='/services' image={ConoceIMG} alt={glosary.sectionTitle_2} />
        <div className={styles.imageDesktop}>
          <AnimatedImage image={ConoceIMG} alt={glosary.sectionTitle_2} reverse={true}/>
        </div>
      </Section>
      <Section vertical={true} subtitle={glosary.sectionTitle_3} backgroundColor={'#fff'}>
        <div className={styles.listHighlights}>
          {
            listaBeneficios.map((el, index) => (<Highlight key={index} title={el?.title} alt={`highlight${index}`} img={el?.img} description={el?.title} />))
          }
        </div>

      </Section>
      <Section backgroundColor='#EDF0F4'>
        <Article title={glosary.sectionMiniTitle_3} subtitle={glosary.sectionTitle_4} list={glosary.sectionList_4} buttonText={glosary.sectionButton_2} buttonAction='/services' image={AsesoramientoIMG} alt={glosary.sectionTitle_3}/>
        <div className={styles.imageDesktop}>
          <AnimatedImage image={AsesoramientoIMG} alt={glosary.sectionTitle_3}/>
        </div>
      </Section>
      {/* <Section>
        <div className={styles.listReview}>
          <Review title={glosary.reviewName_1} img={Testigo1} description={glosary.reviewDescription_1} />
          <Review title={glosary.reviewName_2} img={Testigo2} description={glosary.reviewDescription_2} />
          <Review title={glosary.reviewName_3} img={Testigo3} description={glosary.reviewDescription_3} />
        </div>
      </Section> */}
    </main>
  )
}

export default Home