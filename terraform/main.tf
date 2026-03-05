terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Cloud Run Service for FastAPI Middleware
resource "google_cloud_run_v2_service" "orchestrator" {
  name     = "mnk-orchestrator"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder image
      ports {
        container_port = 8000
      }

    }
  }
}

# # AlloyDB Cluster for conversation history
# resource "google_alloydb_cluster" "default" {
#   cluster_id = "mnk-conv-history-cluster"
#   location   = var.region
#   network_config {
#     network = "projects/${var.project_id}/global/networks/default"
#   }
# }
# 
# resource "google_alloydb_instance" "primary" {
#   cluster       = google_alloydb_cluster.default.name
#   instance_id   = "mnk-conv-history-primary"
#   instance_type = "PRIMARY"
#   
#   machine_config {
#     cpu_count = 2
#   }
# }

# Secret Manager for API Keys
resource "google_secret_manager_secret" "api_keys" {
  for_each = toset(["DEEPGRAM_API_KEY", "OPENAI_API_KEY", "ELEVENLABS_API_KEY", "GEMINI_API_KEY"])
  
  secret_id = each.key
  replication {
    auto {}
  }
}
