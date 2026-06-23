package com.finflow.api.controller;

import com.finflow.api.dto.IssueCardRequest;
import com.finflow.api.model.VirtualCard;
import com.finflow.api.service.VirtualCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class VirtualCardController {

    private final VirtualCardService virtualCardService;

    @PostMapping("/issue")
    public ResponseEntity<VirtualCard> issueCard(@RequestBody IssueCardRequest request, Authentication auth) {
        VirtualCard card = virtualCardService.issueNewCard(auth.getName(), request.getCardholderName(), request.getLimit());
        return ResponseEntity.ok(card);
    }

    @GetMapping("/my-cards")
    public ResponseEntity<List<VirtualCard>> getMyCards(Authentication auth) {
        return ResponseEntity.ok(virtualCardService.getMyCards(auth.getName()));
    }
}