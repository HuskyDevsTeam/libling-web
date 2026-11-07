-- CreateIndex
CREATE INDEX "Affiliate_plan_date_idx" ON "Affiliate"("plan_date");

-- CreateIndex
CREATE INDEX "Pay_status_idx" ON "Pay"("status");

-- CreateIndex
CREATE INDEX "Property_active_countryId_id_idx" ON "Property"("active", "countryId", "id");
