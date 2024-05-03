import React, { useState, useEffect, useReducer } from "react";
import axios from "axios"; 

const FriendListModal = ({ socket, handleFriendInviteModalClose, isShowFriendModal, setIsShowFriendModal}) => {
   
    const [friends, setFriends] = useState([]);
    const [userInfo, setUserInfo] = useState('');
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [isShowChatNameInput, setIsShowChatNameInput] = useState(false);
    const [chatName, setChatName] = useState('');
    const [selectedFriendDetails, setSelectedFriendDetails] = useState([]);

    const fetchFriends = () => {
        axios({
            url: `http://localhost:3001/chatRoom/getFriendList`, 
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (response.data) {
                setFriends(response.data);
            } else {
                alert('친구 목록을 불러오는 데 실패했습니다.');
            }
        })
        .catch(error => {
            alert(`Error: ${error.message}`);
        });
    };

    const fetchUser = () => {
        axios({
            url: `http://localhost:3001/chatRoom/getUserInfo`, 
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (response.data) {

                setUserInfo(response.data);
                console.log('user info -----> ', response.data);

            } else {

                alert('user 정보를 불러오는 데 실패했습니다.');

            }
        })
        .catch(error => {

            alert(`Error: ${error.message}`);

        });
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    useEffect(() => {
        fetchUser(); // 컴포넌트 마운트 시 사용자 정보를 불러옵니다.
      }, []);

    if (!isShowFriendModal) return null; // 모달을 표시하지 않을 경우 렌더링하지 않음

    const handleFriendSelection = (friendNo) => {
        const friend = friends.find(f => f.FRIEND_NO === friendNo);
        if (selectedFriends.includes(friendNo)) {
          // 이미 선택된 경우, 선택 목록에서 제거
          setSelectedFriends(selectedFriends.filter(no => no !== friendNo));
          setSelectedFriendDetails(selectedFriendDetails.filter(f => f.FRIEND_NO !== friendNo));
        } else {
          // 선택되지 않은 경우, 선택 목록에 추가
          setSelectedFriends([...selectedFriends, friendNo]);
          setSelectedFriendDetails([...selectedFriendDetails, friend]);
        }
    };
      
    const handleCreateRoom = () => {
        console.log('handleCreateRoom()');
    
        // 선택된 친구가 한 명 이상인지 확인
        if (selectedFriends.length > 0) {
            console.log('친구 선택됨');
            // 친구를 선택했으므로 채팅방 이름 입력 모달을 표시
            setIsShowChatNameInput(true);
            
        } else {
            console.log('선택된 친구 없음');
            // 경고 메시지 표시 또는 사용자에게 친구 선택을 요청하는 처리
            alert('최소 한 명의 친구를 선택해주세요.');
        }

    };

    // 채팅방 이름
    const newChatTitleNameInputChange = (e) => {
        console.log('newChatTitleNameInputChange()');
        let inputName = e.target.name;
        let inputValue = e.target.value;

        if(inputName === 'room_default_name'){
            
            setChatName(inputValue);
            console.log('변경할 채팅방 이름 : ', inputValue);
            
        } else if(inputName === 'room_personnel'){
            
            setSelectedFriends(inputValue);
            console.log('채팅할 친구 : ', inputValue);
            
        } 
    }    
 
    const newChatStartBtnClickHandler = () => {
        const newChatData = {
            room_default_name: chatName, // 사용자가 입력한 채팅방 이름
            participants: selectedFriendDetails, // 참여자 정보
            userInfo: userInfo, // 채팅방 설명 추가
            // 필요에 따라 추가할 다른 데이터 필드
        };
    
        // Socket을 사용하여 서버로 채팅방 생성 요청을 합니다.
        console.log('[friends modal] newChatData -----> ', newChatData);
        console.log('[friends modal] selectedFriendDetails -----> ', selectedFriendDetails);
        console.log('[friends modal] userInfo -----> ', userInfo);
        socket.emit('createRoom', newChatData);
        // 필요한 추가 로직(예: 상태 초기화 등)
    }

    return (
        <div className="friendWrap">
            <div className="friend">
                <p>친구 리스트</p>
                {friends.map(friend => (
                    <div key={friend.FRIEND_NO}>
                        <input 
                          type="checkbox" 
                          checked={selectedFriends.includes(friend.FRIEND_NO)}
                          onChange={() => handleFriendSelection(friend.FRIEND_NO)}
                        />
                        {friend.FRIEND_TARGET_NAME}
                    </div>
                ))}
                <button onClick={handleCreateRoom}>친구 선택</button>
                <button onClick={handleFriendInviteModalClose}>닫기</button>
            </div>
            {
                isShowChatNameInput
                ?
                <>
                    <form name="newChatTitle">
                        <input type="hidden" name="user_no" value={userInfo.USER_NO} onChange={(e)=>newChatTitleNameInputChange(e)} />                        
                        <input type="hidden" name="user_nickname" value={userInfo.USER_NICKNAME} onChange={(e)=>newChatTitleNameInputChange(e)} />                        
                        <input type="text" name="room_default_name" value={chatName} onChange={(e)=>newChatTitleNameInputChange(e)} />                        
                        <input type="button" value="NEW CHAT" onClick={newChatStartBtnClickHandler} />
                    </form>
                </>
                :
                null
            }
        </div>
    );
}

export default FriendListModal;
