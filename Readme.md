﻿# Struct.Umbraco.StructPimPicker

This integration provides a custom product picker that can be used as a property editor 
for content, a value converter providing a strongly typed model for rendering selected 
products in [StructPIM](https://www.struct.com/).

## Prerequisites

Required minimum versions of Umbraco CMS: 
- CMS: 10.3.0

## How To Use

### Authentication

Accessing the resources from StructPIM through the REST API requires an API key and an API Url.

To retrieve your API key, go to _Settings_ -> _API Configuration_ and generate your key.

### Configuration

The following configuration is required for working with the StructPIM API:

```
{
  "StructPIM": {
    "CMS": {
      "ApiUrl": "https://[API_base_url]/",
      "ApiKey": "[API_key]",
      "DefaultLanguage": "en-GB"
    }
  }
}
```

### Backoffice usage

To use the product picker, a new data type should be created based on the `Struct PIM Picker` property editor.

If the configuration is not valid, an error message will be displayed.

You can then select which item types should be selectable and which Catalogue to use for selection.

When selecting items you can use the build-in search in StructPIM to select which columms to display and/or seach to find the items you like to select.

### Front-end rendering

A strongly typed model will be generated by the property value converter.
