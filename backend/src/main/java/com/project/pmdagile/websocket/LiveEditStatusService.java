package com.project.pmdagile.websocket;

import com.project.pmdagile.websocket.dto.ModelEditStatusDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RequiredArgsConstructor
@Service
public class LiveEditStatusService {

    private static final Duration LOCK_TIMEOUT = Duration.ofSeconds(10);
    private final Map<Long, ModelLock> userModelLocks = new ConcurrentHashMap<>();

    private final SimpMessagingTemplate messagingTemplate;

    public void userLocksModel(String username, Long modelId) {
        if (!userModelLocks.containsKey(modelId)) {
            sendModelIsLockedNotification(modelId, username);
        }
        userModelLocks.put(modelId, new ModelLock(username, Instant.now()));
        log.info("User {} locks model {}", username, modelId);
    }

    public void userUnlocksModel(String username, Long modelId) {
        ModelLock modelLock = userModelLocks.get(modelId);
        if (modelLock != null && modelLock.username.equals(username)) {
            userModelLocks.remove(modelId);
            log.info("User {} unlocks model {}", username, modelId);
            sendModelIsFreeNotification(modelId);
        } else {
            log.warn("User {} tried to unlock model {} but was not the editor", username, modelId);
        }
    }

    public ModelEditStatusDto getModelEditStatus(Long modelId) {
        ModelLock modelLock = userModelLocks.get(modelId);
        if (modelLock == null || Instant.now().isAfter(modelLock.lastSeen().plus(LOCK_TIMEOUT))) {
            userModelLocks.remove(modelId);
            return new ModelEditStatusDto(modelId, null, true);
        }
        return new ModelEditStatusDto(modelId, modelLock.username(), false);
    }

    @Scheduled(fixedRate = 1000)
    public void checkForExpiredLocks() {
        Instant now = Instant.now();
        userModelLocks.entrySet().removeIf(entry -> {
            Long modelId = entry.getKey();
            ModelLock modelLock = entry.getValue();
            if (now.isAfter(modelLock.lastSeen().plus(LOCK_TIMEOUT))) {
                log.info("Lock for model {} by user {} has expired", modelId, modelLock.username);
                sendModelIsFreeNotification(modelId);
                return true;
            }
            return false;
        });
    }

    private void sendModelIsFreeNotification(Long modelId) {
        log.info("Sending model is free notification for model {}", modelId);
        messagingTemplate.convertAndSend("/topic/model-free/" + modelId, modelId);
    }

    private void sendModelIsLockedNotification(Long modelId, String username) {
        log.info("Sending model is locked notification for model {}", modelId);
        messagingTemplate.convertAndSend("/topic/model-locked/" + modelId, username);
    }

    private record ModelLock(String username, Instant lastSeen) {
    }
}
