//================= use existing Autonomous Database =======================================

variable "existing_autonomous_database_id" {
  type    = string
  default = "ocid1.autonomousdatabase.oc1.mx-queretaro-1.anyxeljry52vqmiavcfjww7mzcjekoozcgdlr3hjip5osfsoavrhsxjhxv4q"
}

variable "autonomous_database_db_workload" {
  default = "OLTP"
}

variable "existing_autonomous_database_display_name" {
  default = "OctoTask"
}

# Read the existing Autonomous Database by OCID
data "oci_database_autonomous_database" "autonomous_database_atp" {
  autonomous_database_id = var.existing_autonomous_database_id
}

# Optional: also list databases in the compartment filtered by display name/workload
data "oci_database_autonomous_databases" "autonomous_databases_atp" {
  compartment_id = var.ociCompartmentOcid
  display_name   = var.existing_autonomous_database_display_name
  db_workload    = var.autonomous_database_db_workload
}

#======= Name space details ------------------------------------------------------
data "oci_objectstorage_namespace" "test_namespace" {
  compartment_id = var.ociCompartmentOcid
}

#========= Outputs ===========================
output "ns_objectstorage_namespace" {
  value = [data.oci_objectstorage_namespace.test_namespace.namespace]
}

output "autonomous_database_id" {
  value = data.oci_database_autonomous_database.autonomous_database_atp.id
}

output "autonomous_database_display_name" {
  value = data.oci_database_autonomous_database.autonomous_database_atp.display_name
}

output "autonomous_database_db_name" {
  value = data.oci_database_autonomous_database.autonomous_database_atp.db_name
}

output "autonomous_database_compartment_id" {
  value = data.oci_database_autonomous_database.autonomous_database_atp.compartment_id
}