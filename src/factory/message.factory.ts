import imagesHelper from '../helpers/images.helper';

const messageFactory = {
  getMessagesForArticle(rawMessages: any | null, userId: string) {
    return rawMessages
      .map((message: any) => {
        const isSender = message.id_first_profile === userId;
        return {
          _id: message.id,
          text: message.message,
          isSender,
          user: {
            _id: message.id_first_profile.id,
            name: message.id_first_profile.username,
            avatar: imagesHelper.getPublicUrlByImageName(
              message.id_first_profile.avatar_url,
            ),
          },
          createdAt: message.created_at,
          otherId: isSender
            ? message.id_second_profile
            : message.id_first_profile,
        };
      })
      .sort((a: any, b: any) => {
        return b._id - a._id;
      });
  },
  formatNewMessageReceived(message: any, userId: string, userToAdd: any) {
    const isSender = message.id_first_profile === userId;
    return {
      _id: message.id,
      text: message.message,
      isSender,
      user: {
        _id: userToAdd.id,
        name: userToAdd.name,
        avatar: userToAdd.avatar,
      },
      createdAt: message.created_at,
      otherId: isSender ? message.id_second_profile : message.id_first_profile,
    };
  },
};
export default messageFactory;
