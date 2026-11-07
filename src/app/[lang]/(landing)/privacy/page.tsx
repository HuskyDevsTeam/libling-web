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
const Privacy: React.FC<IPage> = props => {
    const params = use(props.params);

    const {
        lang
    } = params;

    const glosary = dict[lang]?.privacy
    const { height, width } = useWindowDimensions();
    const list = [
        { title: glosary.title1, list: glosary.description1 },
        { title: glosary.title2, list: glosary.description2 },
        { title: glosary.title3, list: glosary.description3 },
        { title: glosary.title4, list: glosary.description4 },
        { title: glosary.title5, list: glosary.description5 },
        { title: glosary.title6, list: glosary.description6 },
    ]

    return (
        <main className={styles.main}>
            <Section backgroundColor='#fff' vertical={true}>
                <div style={{padding:24}}>
                <h2>{glosary.mainTitle}</h2>
                {
                    list.map((el,index)=>(<div key={index}>
                        <h4 className={globalStyles.miniTitle} style={{paddingBottom:36, paddingTop:36}}>{el.title}</h4>
                        <div>
                        {
                            el.list.map((listElement,listIndex)=>(<p key={listIndex} style={{paddingBottom:16}}>
                                {listElement}
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

export default Privacy