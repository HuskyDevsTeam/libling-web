'use client'
import React, { use } from 'react';
import styles from './page.module.css'
import globalStyles from '@/app/globals.module.css'
import { poppinsBold, poppinsRegular, poppinsSemiBold } from '@/app/fonts'
import Section from '@/app/components/section'
import { dict } from '@/app/utils'
import useWindowDimensions from '@/app/hooks/useWindowDimensions'
interface IPage {
    params: Promise<{
        lang: "es" | "en" | "fr"
    }>
}
const Terms: React.FC<IPage> = props => {
    const params = use(props.params);

    const {
        lang
    } = params;

    const glosary = dict[lang]?.terms
    const { height, width } = useWindowDimensions();
    const list = [
        { title: glosary.title1, list: glosary.description1 },
        { title: glosary.title2, list: glosary.description2 },
        { title: glosary.title3, list: glosary.description3 },
        { title: glosary.title4, list: glosary.description4 },
        { title: glosary.title5, list: glosary.description5 },
        { title: glosary.title6, list: glosary.description6 },
        { title: glosary.title7, list: glosary.description7 },
        { title: glosary.title8, list: glosary.description8 },
        { title: glosary.title9, list: glosary.description9 },
        { title: glosary.title10, list: glosary.description10 },
    ]

    return (
        <main className={styles.main}>
            <Section backgroundColor='#fff' vertical={true}>
                <div style={{padding:24}}>
                <h2>{glosary.mainTitle}</h2>
                {
                    list.map((el,index)=>(<div key={index}>
                        <h4 className={globalStyles.miniTitle} style={{paddingBottom:36, paddingTop:36}}>{index+1}{'. '}{el.title}</h4>
                        <div>
                        {
                            el.list.map((listElement,listIndex)=>(<p key={listIndex} style={{paddingBottom:16}}>
                                <span style={poppinsSemiBold.style}>
                                    {index+1}{'.'}{listIndex + 1}
                                </span>
                                {'. '}{
                                    listElement.split("\n").map((textElement, textIndex)=>(
                                        (textIndex === 0) ? <span key={textIndex}>{textElement}</span> : (textIndex === 1) ? <span key={textIndex}><br/><br/><p style={{marginLeft:24}}>{textElement}</p></span> : <span key={textIndex}><br/><p style={{marginLeft:24}}>{textElement}</p></span>
                                    ))
                                }
                            </p>))
                        }
                        </div>
                    </div>))
                }
                </div>
            </Section>
        </main>
    )
}

export default Terms