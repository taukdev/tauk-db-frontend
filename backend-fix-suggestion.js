// Backend Controller Fix - Add null check
export const createPlatformOrderController = async (req, res) => {
    try {
        const platformId = req.params.platform_id;
        const createdBy = req.user?.user_id || null;

        if (!platformId) {
            return res.status(400).json({
                status: "failed",
                error: "Platform ID is required"
            });
        }

        const result = await createPlatformOrder(platformId, req.body, createdBy);

        // Add null check here
        if (!result) {
            return res.status(500).json({
                status: "failed",
                error: "Failed to create platform order - database returned null"
            });
        }

        if (result.methodStatus === "failed") {
            if (result.error.includes("not found")) {
                return res.status(404).json({
                    status: "failed",
                    error: result.error
                });
            }
            if (result.error.includes("already exists")) {
                return res.status(409).json({
                    status: "failed",
                    error: result.error
                });
            }
            return res.status(400).json({
                status: "failed",
                error: result.error
            });
        }

        return res.status(201).json({
            status: "success",
            data: result.data
        });

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            error: error.message || "Internal server error"
        });
    }
};
