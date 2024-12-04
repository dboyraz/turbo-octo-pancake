cmake_minimum_required(VERSION 3.10)
project(FunctionFlow)

# Set C++ Standard
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include FetchContent module
include(FetchContent)

# Fetch Googletest
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/tags/release-1.12.1.zip
)

# For Windows: Prevent overriding the parent project's compiler/linker settings
if (MSVC)
  set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
endif()

FetchContent_MakeAvailable(googletest)

# Find glog
find_package(glog REQUIRED)

# Add executable
add_executable(test
  common.cpp
  main.cpp
  fast_liquid_vote.cpp
  naive_liquid_vote.cpp
  liquid_democracy.cpp
  fast_liquid_vote_preparer.cpp
  ./test/test_simple.cpp
  ./test/test_random.cpp
)

# Link libraries
target_link_libraries(test PRIVATE gtest_main glog::glog)
