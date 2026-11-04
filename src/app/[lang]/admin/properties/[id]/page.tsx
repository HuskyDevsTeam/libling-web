import React from 'react'
import styles from './page.module.css'
import { dict } from '@/app/utils'
import { showProperty } from '@/services'
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
import CustomMap from '@/app/components/map'

interface IDetail {
    params: {
        id: string
        lang: "es" | "en" | "fr"
    }
}

const Detail: React.FC<IDetail> = async ({ params: { id, lang } }) => {
    const property = await showProperty({ id: parseInt(id) })
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
        <InnerNav text={glosaryAdmin.actionPreview} admin={true} />
        <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button title={glosaryAdmin.actionEdit} type='outline' goTo={`/admin/properties/${id}/edit`} />
            </div>
            <div className={styles.head}>
                <ImageGallery images={property?.PropertyImage} thumbnail={property?.thumbnail} />
                <div className={styles.summaryContainer}>
                    <div className={styles.textContainer}>
                        <h4 className={styles.type} style={poppinsRegular.style}>
                            {
                                property?.active
                                    ?
                                    <span className={styles.badgeActive}>
                                        {glosaryAdmin.activePub}
                                    </span>
                                    :
                                    <span className={styles.badge}>

                                        {glosaryAdmin.inactivePub}
                                    </span>
                            }
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
                            <IconArea fill='#1973FA' />
                            <span>
                                {`${glosaryAdmin.formLabelArea}: ${property?.area} m${"\u00B2"}`}
                            </span>
                        </span>
                        <span className={styles.feature}>
                            <IconBed fill='#1973FA' />
                            <span>
                                {`${glosaryAdmin.formLabelBedrooms}: ${property?.bedrooms || 0}`}
                            </span>
                        </span>
                        <span className={styles.feature}>
                            <IconBath fill='#1973FA' />
                            <span>
                                {`${glosaryAdmin.formLabelBathrooms}: ${property?.bathrooms || 0}`}
                            </span>
                        </span>
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
                                    property?.bedrooms?.toNumber()
                                }
                            </div>
                        </div>
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
                                    property?.bathrooms?.toNumber()
                                }
                            </div>
                        </div>
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