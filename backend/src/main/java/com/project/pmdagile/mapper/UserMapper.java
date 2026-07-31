package com.project.pmdagile.mapper;

import com.project.pmdagile.auth.user.User;
import com.project.pmdagile.dto.UserDto;
import org.springframework.stereotype.Service;

@Service
public class UserMapper {
    public UserDto toUserDto(User user) {
        return new UserDto(
                user.getFirstname(),
                user.getLastname(),
                user.getEmail(),
                user.isJiraAuthenticated()
        );
    }

    public User toUser(UserDto userDto) {
        return User.builder()
                .firstname(userDto.firstname())
                .lastname(userDto.lastname())
                .email(userDto.email())
                .isJiraAuthenticated(userDto.isJiraAuthenticated())
                .build();
    }
}
