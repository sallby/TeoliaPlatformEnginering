provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
  skip_provider_registration = true
}

data "azurerm_policy_definition" "location_policy" {
  display_name = "Allowed locations"
}
data "azurerm_policy_definition" "size_vm_policy" {
  display_name = "Taille autorisée des machines virtuelles"
}
module "rg" {
  source       = "./modules/resource_group"
  nomRessource = var.nomRessource
  localisation = var.localisation
}

resource "azurerm_resource_group_policy_assignment" "location_policy" {
  name                 = "location-policy"
  resource_group_id    = module.rg.resource_group_id
  policy_definition_id = data.azurerm_policy_definition.location_policy.id
  parameters           = <<PARAMETERS
    {
        "listOfAllowedLocations": {
            "value": ["westeurope", "northeurope", "francecentral"]
        }
    }
  PARAMETERS
}

resource "azurerm_resource_group_policy_assignment" "size_vm_policy" {
  name                 = "size_vm_policy"
  resource_group_id    = module.rg.resource_group_id
  policy_definition_id = data.azurerm_policy_definition.size_vm_policy.id
  parameters           = <<PARAMETERS
    {
        "listOfAllowedSKUs": {
            "value": ["basic_a0","basic_a1","basic_a2","standard_a0","standard_a1","standard_a1_v2","standard_a2","standard_f1s","standard_f2","standard_f2s","standard_b1s","standard_b2s","standard_b1ls","standard_ds1_v2","standard_ds2_v2","standard_ds2_v2_promo"]
        }
    }
  PARAMETERS
}

