package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.request.PartnerImageRequest;
import backend.dto.response.ApiResponse;
import backend.entity.Partner;
import backend.entity.PartnerImage;
import backend.repository.PartnerImageRepository;
import backend.repository.PartnerRepository;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/partners")
@RequiredArgsConstructor
@Slf4j
public class AdminPartnerImageController extends BaseController {

    private final PartnerRepository partnerRepository;
    private final PartnerImageRepository partnerImageRepository;

    @PostMapping("/{id}/images")
    @Operation(summary = "Add image to partner")
    @Transactional
    public ResponseEntity<ApiResponse<List<PartnerImage>>> addImage(
            @PathVariable Long id,
            @RequestBody PartnerImageRequest request
    ) {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        PartnerImage image = new PartnerImage();
        image.setPartner(partner);
        image.setImageUrl(request.getImageUrl());
        image.setImageType(request.getImageType());
        image.setDisplayOrder(request.getDisplayOrder());
        image.setAltText(request.getAltText());
        partnerImageRepository.save(image);

        List<PartnerImage> images = partnerImageRepository.findByPartnerIdOrderByDisplayOrderAsc(id);
        return ResponseEntity.ok(success("Image added", images));
    }

    @DeleteMapping("/images/{imageId}")
    @Operation(summary = "Delete partner image")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long imageId) {
        partnerImageRepository.deleteById(imageId);
        return ResponseEntity.ok(success("Image deleted", null));
    }

    @PatchMapping("/images/{imageId}")
    @Operation(summary = "Update partner image (type/order/alt)")
    @Transactional
    public ResponseEntity<ApiResponse<PartnerImage>> updateImage(
            @PathVariable Long imageId,
            @RequestBody PartnerImageRequest request
    ) {
        PartnerImage image = partnerImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Partner image not found"));

        if (request.getImageType() != null) image.setImageType(request.getImageType());
        if (request.getDisplayOrder() != null) image.setDisplayOrder(request.getDisplayOrder());
        if (request.getAltText() != null) image.setAltText(request.getAltText());
        partnerImageRepository.save(image);

        return ResponseEntity.ok(success("Image updated", image));
    }

    @GetMapping("/{id}/images")
    @Operation(summary = "List partner images")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<PartnerImage>>> listImages(@PathVariable Long id) {
        List<PartnerImage> images = partnerImageRepository.findByPartnerIdOrderByDisplayOrderAsc(id);
        return ResponseEntity.ok(success("OK", images));
    }
}


