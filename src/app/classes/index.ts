import { IPropertyCreateDTO, IPropertyUpdateDTO } from "../interfaces/models"

export class PropertyCreate {
      title
      content
      address
      thumbnail
      longitude
      latitude
      area
      bedrooms
      bathrooms
      price
      heatingType
      heatingMedium
      heatingEnergy
      view
      furnished
      parking
      elevator
      active
      type
      frecuency
      publishedById
      countryId
      currencyId
      propertyTypeId
    constructor(data:IPropertyCreateDTO) {
      this.title = data.title
      this.content = data.content
      this.address = data.address
      this.thumbnail = data.thumbnail
      this.longitude = data.longitude
      this.latitude = data.latitude
      this.area = data.area
      this.bedrooms = data.bedrooms
      this.bathrooms = data.bathrooms
      this.price = data.price
      this.heatingType = data.heatingType
      this.heatingMedium = data.heatingMedium
      this.heatingEnergy = data.heatingEnergy
      this.view = data.view
      this.furnished = data.furnished
      this.parking = data.parking
      this.elevator = data.elevator
      this.active = data.active
      this.type = data.type
      this.frecuency = data.frecuency
      this.publishedById = data.publishedById
      this.countryId = data.countryId
      this.currencyId = data.currencyId
      this.propertyTypeId = data.propertyTypeId
    }
  }
export class PropertyUpdate {
      title
      content
      address
      thumbnail
      longitude
      latitude
      area
      bedrooms
      bathrooms
      price
      heatingType
      heatingMedium
      heatingEnergy
      view
      furnished
      parking
      elevator
      active
      type
      frecuency
      publishedById
      countryId
      currencyId
      propertyTypeId
    constructor(data:IPropertyUpdateDTO) {
      this.title = data.title
      this.content = data.content
      this.address = data.address
      this.thumbnail = data.thumbnail
      this.longitude = data.longitude
      this.latitude = data.latitude
      this.area = data.area
      this.bedrooms = data.bedrooms
      this.bathrooms = data.bathrooms
      this.price = data.price
      this.heatingType = data.heatingType
      this.heatingMedium = data.heatingMedium
      this.heatingEnergy = data.heatingEnergy
      this.view = data.view
      this.furnished = data.furnished
      this.parking = data.parking
      this.elevator = data.elevator
      this.active = data.active
      this.type = data.type
      this.frecuency = data.frecuency
      this.publishedById = data.publishedById
      this.countryId = data.countryId
      this.currencyId = data.currencyId
      this.propertyTypeId = data.propertyTypeId
    }
  }
