
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "activity_logs": {
                  Row: {
                    "action": string,"actor_id": string | null,"created_at": string,"entity_id": string | null,"entity_type": string,"id": string,"summary": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type": string,"id"?: string,"summary"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type"?: string,"id"?: string,"summary"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"blog_categories": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"name": string,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"name": string,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"name"?: string,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"blog_posts": {
                  Row: {
                    "author_id": string | null,"author_name": string | null,"category_id": string | null,"content_html": string,"cover_image_alt": string | null,"cover_image_url": string | null,"created_at": string,"excerpt": string | null,"id": string,"is_featured": boolean,"og_image_url": string | null,"published_at": string | null,"reading_minutes": number,"seo_description": string | null,"seo_title": string | null,"slug": string,"status": Database["public"]['Enums']["content_status"],"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"author_name"?: string | null,"category_id"?: string | null,"content_html"?: string,"cover_image_alt"?: string | null,"cover_image_url"?: string | null,"created_at"?: string,"excerpt"?: string | null,"id"?: string,"is_featured"?: boolean,"og_image_url"?: string | null,"published_at"?: string | null,"reading_minutes"?: number,"seo_description"?: string | null,"seo_title"?: string | null,"slug": string,"status"?: Database["public"]['Enums']["content_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "author_id"?: string | null,"author_name"?: string | null,"category_id"?: string | null,"content_html"?: string,"cover_image_alt"?: string | null,"cover_image_url"?: string | null,"created_at"?: string,"excerpt"?: string | null,"id"?: string,"is_featured"?: boolean,"og_image_url"?: string | null,"published_at"?: string | null,"reading_minutes"?: number,"seo_description"?: string | null,"seo_title"?: string | null,"slug"?: string,"status"?: Database["public"]['Enums']["content_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "blog_posts_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "blog_categories"
      referencedColumns: ["id"]
    }
                  ]
                },"inquiries": {
                  Row: {
                    "budget": string | null,"business_name": string | null,"created_at": string,"description": string,"email": string,"full_name": string,"id": string,"ip_hash": string | null,"phone": string | null,"service": string,"source": string,"status": Database["public"]['Enums']["inquiry_status"],"timeline": string | null,"updated_at": string,"user_agent": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "budget"?: string | null,"business_name"?: string | null,"created_at"?: string,"description": string,"email": string,"full_name": string,"id"?: string,"ip_hash"?: string | null,"phone"?: string | null,"service": string,"source"?: string,"status"?: Database["public"]['Enums']["inquiry_status"],"timeline"?: string | null,"updated_at"?: string,"user_agent"?: string | null
                  }
                  Update: {
                    "budget"?: string | null,"business_name"?: string | null,"created_at"?: string,"description"?: string,"email"?: string,"full_name"?: string,"id"?: string,"ip_hash"?: string | null,"phone"?: string | null,"service"?: string,"source"?: string,"status"?: Database["public"]['Enums']["inquiry_status"],"timeline"?: string | null,"updated_at"?: string,"user_agent"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"inquiry_notes": {
                  Row: {
                    "author_id": string | null,"body": string,"created_at": string,"id": string,"inquiry_id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"body": string,"created_at"?: string,"id"?: string,"inquiry_id": string,"updated_at"?: string
                  }
                  Update: {
                    "author_id"?: string | null,"body"?: string,"created_at"?: string,"id"?: string,"inquiry_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "inquiry_notes_inquiry_id_fkey"
      columns: ["inquiry_id"]
isOneToOne: false
      referencedRelation: "inquiries"
      referencedColumns: ["id"]
    }
                  ]
                },"media_assets": {
                  Row: {
                    "alt_text": string | null,"bucket": string,"created_at": string,"file_name": string,"height": number | null,"id": string,"mime_type": string,"path": string,"public_url": string,"size_bytes": number,"updated_at": string,"uploaded_by": string | null,"width": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "alt_text"?: string | null,"bucket"?: string,"created_at"?: string,"file_name": string,"height"?: number | null,"id"?: string,"mime_type": string,"path": string,"public_url": string,"size_bytes": number,"updated_at"?: string,"uploaded_by"?: string | null,"width"?: number | null
                  }
                  Update: {
                    "alt_text"?: string | null,"bucket"?: string,"created_at"?: string,"file_name"?: string,"height"?: number | null,"id"?: string,"mime_type"?: string,"path"?: string,"public_url"?: string,"size_bytes"?: number,"updated_at"?: string,"uploaded_by"?: string | null,"width"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string,"email": string,"full_name": string | null,"id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string,"email": string,"full_name"?: string | null,"id": string,"updated_at"?: string
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string,"email"?: string,"full_name"?: string | null,"id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"project_categories": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"name": string,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"name": string,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"name"?: string,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"project_images": {
                  Row: {
                    "alt_text": string | null,"caption": string | null,"created_at": string,"id": string,"image_url": string,"project_id": string,"sort_order": number,"storage_path": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "alt_text"?: string | null,"caption"?: string | null,"created_at"?: string,"id"?: string,"image_url": string,"project_id": string,"sort_order"?: number,"storage_path"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "alt_text"?: string | null,"caption"?: string | null,"created_at"?: string,"id"?: string,"image_url"?: string,"project_id"?: string,"sort_order"?: number,"storage_path"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "project_images_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id"]
    }
                  ]
                },"projects": {
                  Row: {
                    "category_id": string | null,"challenge": string | null,"client_name": string | null,"completed_on": string | null,"cover_image_alt": string | null,"cover_image_url": string | null,"created_at": string,"created_by": string | null,"id": string,"is_featured": boolean,"is_sample": boolean,"og_image_url": string | null,"overview": string | null,"project_url": string | null,"published_at": string | null,"results": string | null,"results_verified": boolean,"seo_description": string | null,"seo_title": string | null,"short_description": string | null,"slug": string,"solution": string | null,"sort_order": number,"status": Database["public"]['Enums']["content_status"],"technologies": (string)[],"title": string,"updated_at": string,"updated_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id"?: string | null,"challenge"?: string | null,"client_name"?: string | null,"completed_on"?: string | null,"cover_image_alt"?: string | null,"cover_image_url"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"is_featured"?: boolean,"is_sample"?: boolean,"og_image_url"?: string | null,"overview"?: string | null,"project_url"?: string | null,"published_at"?: string | null,"results"?: string | null,"results_verified"?: boolean,"seo_description"?: string | null,"seo_title"?: string | null,"short_description"?: string | null,"slug": string,"solution"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["content_status"],"technologies"?: (string)[],"title": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "category_id"?: string | null,"challenge"?: string | null,"client_name"?: string | null,"completed_on"?: string | null,"cover_image_alt"?: string | null,"cover_image_url"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"is_featured"?: boolean,"is_sample"?: boolean,"og_image_url"?: string | null,"overview"?: string | null,"project_url"?: string | null,"published_at"?: string | null,"results"?: string | null,"results_verified"?: boolean,"seo_description"?: string | null,"seo_title"?: string | null,"short_description"?: string | null,"slug"?: string,"solution"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["content_status"],"technologies"?: (string)[],"title"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "projects_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "project_categories"
      referencedColumns: ["id"]
    }
                  ]
                },"rate_limits": {
                  Row: {
                    "bucket_key": string,"created_at": string,"hits": number,"id": string,"updated_at": string,"window_start": string
                  }
                  ComputedFields: never
                  Insert: {
                    "bucket_key": string,"created_at"?: string,"hits"?: number,"id"?: string,"updated_at"?: string,"window_start"?: string
                  }
                  Update: {
                    "bucket_key"?: string,"created_at"?: string,"hits"?: number,"id"?: string,"updated_at"?: string,"window_start"?: string
                  }
                  Relationships: [
                    
                  ]
                },"seo_pages": {
                  Row: {
                    "canonical_url": string | null,"created_at": string,"id": string,"label": string,"meta_description": string | null,"meta_title": string | null,"og_description": string | null,"og_image_url": string | null,"og_title": string | null,"path": string,"robots_follow": boolean,"robots_index": boolean,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "canonical_url"?: string | null,"created_at"?: string,"id"?: string,"label": string,"meta_description"?: string | null,"meta_title"?: string | null,"og_description"?: string | null,"og_image_url"?: string | null,"og_title"?: string | null,"path": string,"robots_follow"?: boolean,"robots_index"?: boolean,"updated_at"?: string
                  }
                  Update: {
                    "canonical_url"?: string | null,"created_at"?: string,"id"?: string,"label"?: string,"meta_description"?: string | null,"meta_title"?: string | null,"og_description"?: string | null,"og_image_url"?: string | null,"og_title"?: string | null,"path"?: string,"robots_follow"?: boolean,"robots_index"?: boolean,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"service_categories": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"services": {
                  Row: {
                    "benefits": (string)[],"category_id": string | null,"created_at": string,"deliverables": (string)[],"faqs": NonNullable<Json>,"hero_heading": string | null,"id": string,"image_alt": string | null,"image_url": string | null,"og_image_url": string | null,"overview": string | null,"problems": (string)[],"scope": (string)[],"seo_description": string | null,"seo_title": string | null,"slug": string,"sort_order": number,"status": Database["public"]['Enums']["content_status"],"summary": string | null,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "benefits"?: (string)[],"category_id"?: string | null,"created_at"?: string,"deliverables"?: (string)[],"faqs"?: NonNullable<Json>,"hero_heading"?: string | null,"id"?: string,"image_alt"?: string | null,"image_url"?: string | null,"og_image_url"?: string | null,"overview"?: string | null,"problems"?: (string)[],"scope"?: (string)[],"seo_description"?: string | null,"seo_title"?: string | null,"slug": string,"sort_order"?: number,"status"?: Database["public"]['Enums']["content_status"],"summary"?: string | null,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "benefits"?: (string)[],"category_id"?: string | null,"created_at"?: string,"deliverables"?: (string)[],"faqs"?: NonNullable<Json>,"hero_heading"?: string | null,"id"?: string,"image_alt"?: string | null,"image_url"?: string | null,"og_image_url"?: string | null,"overview"?: string | null,"problems"?: (string)[],"scope"?: (string)[],"seo_description"?: string | null,"seo_title"?: string | null,"slug"?: string,"sort_order"?: number,"status"?: Database["public"]['Enums']["content_status"],"summary"?: string | null,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "services_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "service_categories"
      referencedColumns: ["id"]
    }
                  ]
                },"site_settings": {
                  Row: {
                    "brand_name": string,"budget_options": (string)[],"contact_email": string | null,"contact_phone": string | null,"created_at": string,"default_og_image_url": string | null,"default_seo_description": string | null,"default_seo_title": string | null,"footer_text": string | null,"id": string,"intro": string | null,"logo_url": string | null,"singleton": boolean,"social_links": NonNullable<Json>,"tagline": string,"timeline_options": (string)[],"updated_at": string,"updated_by": string | null,"website_url": string | null,"whatsapp_message": string | null,"whatsapp_number": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "brand_name"?: string,"budget_options"?: (string)[],"contact_email"?: string | null,"contact_phone"?: string | null,"created_at"?: string,"default_og_image_url"?: string | null,"default_seo_description"?: string | null,"default_seo_title"?: string | null,"footer_text"?: string | null,"id"?: string,"intro"?: string | null,"logo_url"?: string | null,"singleton"?: boolean,"social_links"?: NonNullable<Json>,"tagline"?: string,"timeline_options"?: (string)[],"updated_at"?: string,"updated_by"?: string | null,"website_url"?: string | null,"whatsapp_message"?: string | null,"whatsapp_number"?: string | null
                  }
                  Update: {
                    "brand_name"?: string,"budget_options"?: (string)[],"contact_email"?: string | null,"contact_phone"?: string | null,"created_at"?: string,"default_og_image_url"?: string | null,"default_seo_description"?: string | null,"default_seo_title"?: string | null,"footer_text"?: string | null,"id"?: string,"intro"?: string | null,"logo_url"?: string | null,"singleton"?: boolean,"social_links"?: NonNullable<Json>,"tagline"?: string,"timeline_options"?: (string)[],"updated_at"?: string,"updated_by"?: string | null,"website_url"?: string | null,"whatsapp_message"?: string | null,"whatsapp_number"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"testimonials": {
                  Row: {
                    "avatar_url": string | null,"body": string,"business_name": string | null,"client_name": string,"created_at": string,"designation": string | null,"id": string,"is_approved": boolean,"rating": number | null,"sort_order": number,"status": Database["public"]['Enums']["content_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"body": string,"business_name"?: string | null,"client_name": string,"created_at"?: string,"designation"?: string | null,"id"?: string,"is_approved"?: boolean,"rating"?: number | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["content_status"],"updated_at"?: string
                  }
                  Update: {
                    "avatar_url"?: string | null,"body"?: string,"business_name"?: string | null,"client_name"?: string,"created_at"?: string,"designation"?: string | null,"id"?: string,"is_approved"?: boolean,"rating"?: number | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["content_status"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"user_roles": {
                  Row: {
                    "created_at": string,"created_by": string | null,"id": string,"role": Database["public"]['Enums']["app_role"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"role": Database["public"]['Enums']["app_role"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"role"?: Database["public"]['Enums']["app_role"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "consume_rate_limit":
{ Args: { "p_key": string,"p_limit": number,"p_window_seconds": number }; Returns: boolean
                           },
"current_app_role":
{ Args: Record<PropertyKey, never>; Returns: Database["public"]['Enums']["app_role"]
                           },
"is_staff":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_super_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           }
          }
          Enums: {
            "app_role": "super_admin"|"editor","content_status": "draft"|"published","inquiry_status": "new"|"contacted"|"proposal_sent"|"in_discussion"|"converted"|"closed"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "app_role": ["super_admin", "editor"],"content_status": ["draft", "published"],"inquiry_status": ["new", "contacted", "proposal_sent", "in_discussion", "converted", "closed"]
          }
        }
} as const
