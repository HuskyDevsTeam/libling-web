import React from 'react'
import styles from './page.module.css'
import { dict } from '@/app/utils'
import { showActiveProperty } from '@/server/data'
import ImageGallery from '@/app/components/imageGallery'
import InnerNav from '@/app/components/innerNav'
import { poppinsMedium, poppinsRegular } from '@/app/fonts'
import { combustiblesCalefaccion, mecanismosCalefaccion, medidasAreaTerrenos, mediosCalefaccion, rentPaymentPeriods } from '@/app/utils/data'
import IconArea from '@/app/components/icons/iconArea'
import IconBed from '@/app/components/icons/iconBed'
import IconBath from '@/app/components/icons/iconBath'
import { Button } from '@/app/components/admin/button'
import { ISelectElement, dataTranslate } from '@/app/interfaces'
import { getMapStyles } from '@/app/actions'
import CustomMap from '@/app/components/mapLazy'
import { Metadata, ResolvingMetadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

// Las URLs antiguas usaban el id numérico: /immo/12
const findProperty = (slug: string) =>
    /^\d+$/.test(slug) ? showActiveProperty({ id: parseInt(slug) }) : showActiveProperty({ slug })

interface IDetail {
    params: Promise<{
        slug: string
        lang: "es" | "en" | "fr"
    }>
}
export async function generateMetadata(props: IDetail, parent: ResolvingMetadata): Promise<Metadata> {
    const params = await props.params;
    const property = await findProperty(params.slug)
    const previousImages = property?.PropertyImage?.map(el=>el.path || "") || []
    return {
      title: `Libling Immo | ${property?.title}`,
      openGraph: {
        images: [property?.thumbnail || "", ...previousImages],
        title: property?.title,
        description:property?.content || property?.title,
        url:`https://libling.lu/${params.lang}/immo/${property?.slug}`,
      },
      alternates: { canonical: `https://libling.lu/${params.lang}/immo/${property?.slug}` },
      robots:"index,follow",
      
    }
}


const Detail: React.FC<IDetail> = async props => {
    const params = await props.params;

    const {
        slug,
        lang
    } = params;

    const property = await findProperty(slug)
    if (!property) notFound()
    // URL antigua (id numérico) -> redirección permanente a la URL semántica
    if (slug !== property.slug) permanentRedirect(`/${lang}/immo/${property.slug}`)
    const mapStyle = await getMapStyles()
    const glosary = dict[lang].immo
    const glosaryAdmin = dict[lang].adminProperties
    const glosaryData = dict[lang].data
    const heatingType = mecanismosCalefaccion.find(el => el.key.toString() === property?.heatingType?.toString())?.value
    const heatingMedium = mediosCalefaccion.find(el => el.key.toString() === property?.heatingMedium?.toString())?.value
    const heatingEnergy = combustiblesCalefaccion.find(el => el.key.toString() === property?.heatingEnergy?.toString())?.value
    const findByKey = (array: ISelectElement[], key: number | undefined) => {
        return array.find(el => key?.toString() === el.key.toString())?.value
    }
    return (<>
        <InnerNav text={glosary.backList} />
        <div className={styles.card}>
            <div className={styles.head}>
                <ImageGallery images={property?.PropertyImage} thumbnail={property?.thumbnail} />
                <div className={styles.summaryContainer}>
                    <div className={styles.textContainer}>
                        <h4 className={styles.type} style={poppinsRegular.style}>
                            {
                                `${property?.propertyType?.name && property?.propertyType?.name in glosaryData ? glosaryData[property.propertyType.name as dataTranslate] : property?.propertyType.name} ${glosary.miniatureConector} ${property?.type ? glosaryAdmin.formLabelSale.toLocaleLowerCase() : glosaryAdmin.formLabelRent.toLocaleLowerCase()}`
                            }
                        </h4>
                        <h1 className={styles.title} style={poppinsMedium.style}>
                            {property?.title}
                        </h1>
                        <h3 className={styles.price} style={poppinsRegular.style}>
                            <span>
                                {property?.currency.symbol}
                                {" "}
                                {property?.price?.toNumber()?.toLocaleString('en-US')}
                            </span>
                            {
                                !!property?.frecuency
                                &&
                                <span className={styles.frecuency}>
                                    {" / "}
                                    {rentPaymentPeriods.find(el => el.key.toString() === property?.frecuency?.toString())?.value}
                                </span>
                            }
                        </h3>

                    </div>
                    <div className={styles.featureList}>
                        <span className={styles.feature}>
                            <IconArea fill='#FB8601' />
                            <span>
                                {`${glosaryAdmin.formLabelArea}: ${property?.area} m${"\u00B2"}`}
                            </span>
                        </span>
                        <span className={styles.feature}>
                            <IconBed fill='#FB8601' />
                            <span>
                                {`${glosaryAdmin.formLabelBedrooms}: ${property?.bedrooms}`}
                            </span>
                        </span>
                        <span className={styles.feature}>
                            <IconBath fill='#FB8601' />
                            <span>
                                {`${glosaryAdmin.formLabelBathrooms}: ${property?.bathrooms}`}
                            </span>
                        </span>
                    </div>
                    <div className={styles.buttonContainer}>
                        <Button title={'Whatsapp'} type='secondary'
                            icon='ws' goTo={`https://api.whatsapp.com/send?phone=${352691367757}`}/>
                        <Button title={glosary.askFor} type='outline' goTo='#contact' />
                    </div>
                </div>
            </div>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{glosaryAdmin.formLabelAddress}</h3>
                <p className={styles.address}>
                    {property?.address}
                </p>
                <CustomMap width={1060} height={300} mapStyle={mapStyle} zoom={10} latitude={property?.latitude?.toNumber() || 0} longitude={property?.longitude?.toNumber() || 0} />
            </div>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{glosaryAdmin.previewSectionTitle_2}</h3>
                <div className={styles.sectionContent}>
                    <div className={styles.sectionContentColumn}>
                        <div className={styles.sectionContentRow}>
                            <div className={styles.sectionContentRowTitle}>
                                {
                                    glosaryAdmin.formLabelArea
                                }
                            </div>
                            <div className={styles.sectionContentRowDescription}>
                                {
                                    `${property?.area} m${"\u00B2"}`
                                }
                            </div>
                        </div>
                        {
                            (!!heatingType && heatingType in glosaryData) &&
                            <div className={styles.sectionContentRow}>
                                <div className={styles.sectionContentRowTitle}>
                                    {
                                        glosaryAdmin.formLabelHeatingType
                                    }
                                </div>
                                <div className={styles.sectionContentRowDescription}>
                                    {
                                        (!!heatingType && heatingType in glosaryData) && glosaryData[heatingType as dataTranslate]
                                    }
                                </div>
                            </div>
                        }
                        <div className={styles.sectionContentRow}>
                            <div className={styles.sectionContentRowTitle}>
                                {
                                    glosaryAdmin.formLabelFurnished
                                }
                            </div>
                            <div className={styles.sectionContentRowDescription}>
                                {
                                    property?.furnished ? glosaryAdmin.formOptionYes : glosaryAdmin.formOptionNo
                                }
                            </div>
                        </div>
                        <div className={styles.sectionContentRow}>
                            <div className={styles.sectionContentRowTitle}>
                                {
                                    glosaryAdmin.formLabelElevator
                                }
                            </div>
                            <div className={styles.sectionContentRowDescription}>
                                {
                                    property?.elevator ? glosaryAdmin.formOptionYes : glosaryAdmin.formOptionNo
                                }
                            </div>
                        </div>
                        <div className={styles.sectionContentRow}>
                            <div className={styles.sectionContentRowTitle}>
                                {
                                    glosaryAdmin.formLabelParking
                                }
                            </div>
                            <div className={styles.sectionContentRowDescription}>
                                {
                                    property?.parking || glosaryAdmin.formOptionNo
                                }
                            </div>
                        </div>


                    </div>
                    <div className={styles.sectionContentColumn}>
                        <div className={styles.sectionContentRow}>
                            <div className={styles.sectionContentRowTitle}>
                                {
                                    glosaryAdmin.formLabelBedrooms
                                }
                            </div>
                            <div className={styles.sectionContentRowDescription}>
                                {
                                    property?.bedrooms?.toNumber() || 0
                                }
                            </div>
                        </div>
                        {
                            (!!heatingMedium && heatingMedium in glosaryData) && 
                            <div className={styles.sectionContentRow}>
                                <div className={styles.sectionContentRowTitle}>
                                    {
                                        glosaryAdmin.formLabelHeatingMedium
                                    }
                                </div>
                                <div className={styles.sectionContentRowDescription}>
                                    {
                                        (!!heatingMedium && heatingMedium in glosaryData) && glosaryData[heatingMedium as dataTranslate]
                                    }
                                </div>
                            </div>
                        }


                    </div>
                    <div className={styles.sectionContentColumn}>
                        <div className={styles.sectionContentRow}>
                            <div className={styles.sectionContentRowTitle}>
                                {
                                    glosaryAdmin.formLabelBathrooms
                                }
                            </div>
                            <div className={styles.sectionContentRowDescription}>
                                {
                                    property?.bathrooms?.toNumber() || 0
                                }
                            </div>
                        </div>
                        {
                            (!!heatingEnergy && heatingEnergy in glosaryData) &&
                            <div className={styles.sectionContentRow}>
                                <div className={styles.sectionContentRowTitle}>
                                    {
                                        glosaryAdmin.formLabelHeatingEnergy
                                    }
                                </div>
                                <div className={styles.sectionContentRowDescription}>
                                    {
                                        (!!heatingEnergy && heatingEnergy in glosaryData) && glosaryData[heatingEnergy as dataTranslate]
                                    }
                                </div>
                            </div>
                        }
                    </div>

                </div>
            </div>
            {
                !!property?.content &&
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>{glosaryAdmin.formLabelDescription}</h3>
                    <div className={styles.sectionDescription}>
                        {property?.content}
                    </div>
                </div>
            }
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{glosaryAdmin.previewSectionTitle_3}</h3>
                <div className={styles.sectionContent}>
                    <div className={styles.sectionContentColumn}>
                        {
                            !!property?.view &&

                            <div className={styles.sectionContentRow}>
                                <div className={styles.sectionContentRowTitle}>
                                    {
                                        glosaryAdmin.formLabelView
                                    }
                                </div>
                                <div className={styles.sectionContentRowDescription}>
                                    {
                                        property?.view
                                    }
                                </div>
                            </div>
                        }
                        {
                            !!property?.Surface?.length &&

                            <div className={styles.sectionContentRow}>
                                <div className={styles.sectionContentRowTitle}>
                                    {
                                        glosaryAdmin.formLabelSufaces
                                    }
                                </div>
                                <ul className={styles.sectionContentRowDescription}>
                                    {
                                        property?.Surface?.map((el, index) => (<li key={index} className={styles.listItem}>
                                            <span>{el.quantity}</span>
                                            {" "}
                                            <span>{el.description}</span>
                                            {" "}
                                            <span>{el.name}</span>
                                            {" "}
                                            <span>{findByKey(medidasAreaTerrenos, el.areaId)}</span>
                                        </li>))
                                    }
                                </ul>
                            </div>
                        }
                        {
                            !!property?.Benefits?.length &&
                            <div className={styles.sectionContentRow}>
                                <div className={styles.sectionContentRowTitle}>
                                    {
                                        glosaryAdmin.formLabelBenefits
                                    }
                                </div>
                                <ul className={styles.sectionContentRowDescription}>
                                    {
                                        property?.Benefits?.map((el, index) => (<li key={index} className={styles.listItem}>
                                            <span>{el.name}</span>
                                        </li>))
                                    }
                                </ul>
                            </div>

                        }


                    </div>
                    <div className={styles.sectionContentColumn}>
                        {
                            !!property?.NearPlace?.length &&
                            <div className={styles.sectionContentRow}>
                                <div className={styles.sectionContentRowTitle}>
                                    {
                                        glosaryAdmin.formLabelNearPlaces
                                    }
                                </div>
                                <ul className={styles.sectionContentRowDescription}>
                                    {
                                        property?.NearPlace?.map((el, index) => (<li key={index} className={styles.listItem}>
                                            <span>{el.name}</span>
                                        </li>))
                                    }
                                </ul>
                            </div>

                        }
                        {
                            !!property?.LegalNotice?.length &&
                            <div className={styles.sectionContentRow}>
                                <div className={styles.sectionContentRowTitle}>
                                    {
                                        glosaryAdmin.formLabelLegalNotes
                                    }
                                </div>
                                <ul className={styles.sectionContentRowDescription}>
                                    {
                                        property?.LegalNotice?.map((el, index) => (<li key={index} className={styles.listItem}>
                                            <span>{el.name}</span>
                                        </li>))
                                    }
                                </ul>
                            </div>
                        }


                    </div>

                </div>
            </div>
        </div>
    </>
    )
}

export default Detail