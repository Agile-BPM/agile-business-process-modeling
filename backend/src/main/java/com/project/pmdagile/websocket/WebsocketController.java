package com.project.pmdagile.websocket;

import com.project.pmdagile.websocket.dto.LeaveEditModeDto;
import com.project.pmdagile.websocket.dto.LiveEditModelHeartbeat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Slf4j
@RequiredArgsConstructor
@Controller
public class WebsocketController {

    private final LiveEditStatusService liveEditStatusService;

    @MessageMapping("/live-edit-heartbeat")
    public void userEditsModelHeartbeat(LiveEditModelHeartbeat heartbeat) {
        log.info("Received heartbeat from user {}", heartbeat.username());
        liveEditStatusService.userLocksModel(heartbeat.username(), heartbeat.modelId());
    }

    @MessageMapping("/leave-edit-mode")
    public void userLeavesEditMode(LeaveEditModeDto leaveEditModeDto) {
        log.info("Received leave edit mode request from user {}", leaveEditModeDto.username());
        liveEditStatusService.userUnlocksModel(leaveEditModeDto.username(), leaveEditModeDto.modelId());
    }
}
